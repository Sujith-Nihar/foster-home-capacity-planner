import type { OutreachPriority, ProviderMetricsDto } from "@/lib/types/domain";
import {
  explainOutreachReason,
  type ExplainedOutreachReason,
  type OutreachReasonContext,
} from "@/lib/retention/reason-display";
import { formatOutreachPriorityBadgeLabel } from "@/lib/retention/attention-labels";
import { formatDayCount } from "@/lib/utils/pluralization";
import { formatCount, formatPercent, formatReportingDate } from "@/lib/utils/formatters";

const PLANNING_SIGNAL_DISCLAIMER =
  "This is a planning signal for follow-up, not a prediction of provider closure or non-renewal.";

const STAFF_FACING_TRIGGERED_RULES: Record<string, string> = {
  "Inactive for at least 60 days with a license ending within 90 days":
    "No current placement for at least 60 days and license ending within 90 days.",
  "Inactive for at least 180 days": "No current placement for at least 180 days.",
  "Inactive for at least 90 days": "No current placement for at least 90 days.",
  "Inactive with license expiring within 180 days":
    "No current placement with a license ending within 180 days.",
  "Currently active with license expiring within 60 days":
    "Has a current placement with a license ending within 60 days.",
};

function buildOutreachReasonContext(provider: ProviderMetricsDto): OutreachReasonContext {
  return {
    daysSinceLastPlacement: provider.daysSinceLastPlacement,
    daysUntilExpiration: provider.daysUntilExpiration,
    currentlyHasPlacement: provider.currentlyHasPlacement,
    engagementRateLast365: provider.engagementRateLast365,
    eligibleLicensedDaysLast365: provider.eligibleLicensedDaysLast365,
    activeDaysLast365: provider.activeDaysLast365,
  };
}

function addPlacementInactivityFactor(
  provider: ProviderMetricsDto,
  statements: string[],
  seen: Set<string>,
) {
  if (provider.currentlyHasPlacement) {
    return;
  }

  if (provider.daysSinceLastPlacement === null) {
    addUniqueStatement(statements, seen, "No current foster-home placement.");
    return;
  }

  addUniqueStatement(
    statements,
    seen,
    `No current foster-home placement for ${formatDayCount(provider.daysSinceLastPlacement)}.`,
  );
}

function addLicenseTimingFactor(
  provider: ProviderMetricsDto,
  statements: string[],
  seen: Set<string>,
) {
  addUniqueStatement(
    statements,
    seen,
    `License ends in ${formatDayCount(provider.daysUntilExpiration)}.`,
  );
}

function addUniqueStatement(statements: string[], seen: Set<string>, statement: string) {
  if (seen.has(statement)) {
    return;
  }

  seen.add(statement);
  statements.push(statement);
}

export function buildProviderOutreachFactorStatements(provider: ProviderMetricsDto): string[] {
  const context = buildOutreachReasonContext(provider);
  const statements: string[] = [];
  const seen = new Set<string>();

  if (provider.outreachReasons.length === 0) {
    return statements;
  }

  for (const reason of provider.outreachReasons) {
    if (reason === "No elevated outreach signals at the reporting date") {
      addUniqueStatement(statements, seen, "No elevated outreach signals at the reporting date.");
      continue;
    }

    if (
      reason.includes("license expiring within 90 days") &&
      reason.includes("inactive for at least 60")
    ) {
      addPlacementInactivityFactor(provider, statements, seen);
      addLicenseTimingFactor(provider, statements, seen);
      continue;
    }

    if (reason === "Inactive with license expiring within 180 days") {
      addPlacementInactivityFactor(provider, statements, seen);
      addLicenseTimingFactor(provider, statements, seen);
      continue;
    }

    if (reason === "Currently active with license expiring within 60 days") {
      addLicenseTimingFactor(provider, statements, seen);
      continue;
    }

    if (reason.startsWith("Inactive for at least")) {
      addPlacementInactivityFactor(provider, statements, seen);
      continue;
    }

    if (
      reason.includes("Engagement below") ||
      reason.includes("engagement") ||
      reason === "Currently active with very low annual engagement"
    ) {
      addUniqueStatement(
        statements,
        seen,
        "Limited placement activity during the past 12 months.",
      );
      continue;
    }

    const explained = explainOutreachReason(reason, context).primary;
    addUniqueStatement(statements, seen, explained.endsWith(".") ? explained : `${explained}.`);
  }

  return statements;
}

export function buildOutreachPrioritySummary(priority: OutreachPriority): string {
  return `These conditions meet the ${formatOutreachPriorityBadgeLabel(priority)} rule.`;
}

function joinNarrativeClauses(clauses: string[]): string {
  if (clauses.length === 0) {
    return "";
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  if (clauses.length === 2) {
    return `${clauses[0]} and ${clauses[1]}`;
  }

  return `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}`;
}

function providerHasLicenseTimingSignal(provider: ProviderMetricsDto): boolean {
  return provider.outreachReasons.some(
    (reason) => reason.toLowerCase().includes("license") || reason.includes("expiring"),
  );
}

function providerHasLimitedActivitySignal(provider: ProviderMetricsDto): boolean {
  return provider.outreachReasons.some(
    (reason) => reason.includes("Engagement") || reason.toLowerCase().includes("engagement"),
  );
}

export function buildProviderFlagNarrativeSummary(provider: ProviderMetricsDto): string | null {
  if (
    provider.outreachReasons.length === 0 ||
    provider.outreachReasons.every(
      (reason) => reason === "No elevated outreach signals at the reporting date",
    )
  ) {
    return null;
  }

  const causes: string[] = [];

  if (!provider.currentlyHasPlacement) {
    causes.push("it currently has no active foster-home placement");
  }

  if (providerHasLicenseTimingSignal(provider)) {
    causes.push(`its license expires in ${formatDayCount(provider.daysUntilExpiration)}`);
  }

  if (providerHasLimitedActivitySignal(provider)) {
    causes.push("it has had limited placement activity during the past 12 months");
  }

  if (causes.length === 0) {
    return null;
  }

  return `This provider is flagged for staff review because ${joinNarrativeClauses(causes)}. ${PLANNING_SIGNAL_DISCLAIMER}`;
}

export function formatStaffFacingTriggeredRule(rule: string): string {
  return STAFF_FACING_TRIGGERED_RULES[rule] ?? rule;
}

export type ProviderCalculationDetail = {
  actualValue: string;
  triggeredRule: string;
  whatThisMeans: string;
};

function buildProviderValuesForReason(
  reason: ExplainedOutreachReason,
  provider: ProviderMetricsDto,
): string[] {
  const values: string[] = [];

  if (
    !provider.currentlyHasPlacement &&
    provider.daysSinceLastPlacement !== null &&
    (reason.triggeredRule?.includes("Inactive") ||
      reason.technical.includes("inactive") ||
      reason.actualValue?.includes("since"))
  ) {
    values.push(
      `${formatCount(provider.daysSinceLastPlacement)} days since the most recent completed placement`,
    );
  }

  if (
    reason.triggeredRule?.toLowerCase().includes("license") ||
    reason.technical.toLowerCase().includes("license") ||
    reason.actualValue?.toLowerCase().includes("license") ||
    reason.actualValue?.toLowerCase().includes("expiration")
  ) {
    values.push(`License ends in ${formatDayCount(provider.daysUntilExpiration)}`);
  }

  if (
    reason.triggeredRule?.toLowerCase().includes("placement activity") ||
    reason.primary.includes("Limited placement activity")
  ) {
    if (provider.engagementRateLast365 !== null) {
      values.push(
        `${formatPercent(provider.engagementRateLast365)} of eligible licensed days during the past 12 months`,
      );
    }
  }

  if (values.length === 0 && reason.actualValue) {
    values.push(reason.actualValue);
  }

  return values;
}

function buildActualValueForReason(
  reason: ExplainedOutreachReason,
  provider: ProviderMetricsDto,
): string {
  const values = buildProviderValuesForReason(reason, provider);

  if (values.length > 0) {
    return values[0];
  }

  if (reason.actualValue) {
    return reason.actualValue;
  }

  return "Not available for this rule.";
}

function buildCalculationWhatThisMeans(priority: OutreachPriority): string {
  return `The provider meets the threshold for a ${formatOutreachPriorityBadgeLabel(priority)} review signal.`;
}

export function buildProviderCalculationDetails(
  provider: ProviderMetricsDto,
): ProviderCalculationDetail[] {
  const context = buildOutreachReasonContext(provider);

  return provider.outreachReasons
    .map((reason) => explainOutreachReason(reason, context))
    .filter((reason) => reason.triggeredRule)
    .map((reason) => ({
      actualValue: buildActualValueForReason(reason, provider),
      triggeredRule: reason.triggeredRule!,
      whatThisMeans: buildCalculationWhatThisMeans(provider.outreachPriority),
    }));
}

export function formatRecentPlacementActivityPrimary(activeDaysLast365: number): string {
  return `${formatCount(activeDaysLast365)} days with an active placement`;
}

export function formatRecentPlacementActivitySecondary(
  provider: ProviderMetricsDto,
): string | undefined {
  if (provider.engagementRateLast365 === null) {
    return undefined;
  }

  return `${formatPercent(provider.engagementRateLast365)} of ${formatCount(provider.eligibleLicensedDaysLast365)} eligible licensed days`;
}

export function formatDaysSinceLastPlacementMetric(provider: ProviderMetricsDto): {
  value: string;
  helperText?: string;
} {
  if (provider.currentlyHasPlacement) {
    return { value: "Currently placed" };
  }

  if (provider.daysSinceLastPlacement === null) {
    return { value: "—" };
  }

  return {
    value: `${formatDayCount(provider.daysSinceLastPlacement)} since last placement`,
    helperText: provider.lastCompletedPlacementEnd
      ? `Most recent completed placement ended ${formatReportingDate(provider.lastCompletedPlacementEnd)}.`
      : undefined,
  };
}

export function isLicenseTimingUrgent(daysUntilExpiration: number): boolean {
  return daysUntilExpiration <= 14;
}
