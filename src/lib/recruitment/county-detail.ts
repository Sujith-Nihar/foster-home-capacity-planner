import { AGE_GROUPS } from "@/config/metrics";
import type { AgeGroupLabel } from "@/config/metrics";
import {
  buildAgeGroupPrioritySummary,
  computeStatewideAgeGroupBenchmarks,
  type StatewideAgeGroupBenchmark,
} from "@/lib/recruitment/age-groups";
import {
  buildDataSufficiencyReason,
  getComparisonStatus,
  getSuggestedRecruitmentAttention,
  isLimitedDataCounty,
  type ComparisonStatus,
} from "@/lib/recruitment/classification";
import { summarizeRecruitmentReason } from "@/lib/recruitment/summary-labels";
import type { CountyAgeMetricsDto, CountyMetricsDto } from "@/lib/types/domain";
import {
  formatCount,
  formatCountyName,
  formatNullablePercent,
  formatRatio,
  formatSuggestedRecruitmentAttentionLabel,
} from "@/lib/utils/formatters";

export type CountyReviewFinding = {
  title: string;
  description: string;
};

export type AgeGroupComparisonInterpretation =
  | "Far above typical"
  | "Above typical"
  | "Similar to typical"
  | "Below typical"
  | "Not calculated";

const SIMILAR_TO_TYPICAL_TOLERANCE = 0.1;

export function orderCountyAgeGroups(
  ageGroups: CountyAgeMetricsDto[],
): CountyAgeMetricsDto[] {
  const byLabel = new Map(ageGroups.map((group) => [group.ageGroup, group]));
  const orderedLabels = AGE_GROUPS.map((group) => group.label);

  return orderedLabels
    .map((label) => byLabel.get(label))
    .filter((group): group is CountyAgeMetricsDto => group !== undefined);
}

export function buildCountyExecutiveSummary(county: CountyMetricsDto): string {
  const countyName = formatCountyName(county.county);

  if (isLimitedDataCounty(county)) {
    return `${countyName} is not scored for suggested recruitment attention. ${buildDataSufficiencyReason(county)}`;
  }

  const attention = getSuggestedRecruitmentAttention(county).toLowerCase();
  const ratio = formatRatio(county.childrenPerActiveProvider);
  const outOfCounty = formatNullablePercent(county.outOfCountyFosterRate);
  const ageGroup =
    county.highestPressureAgeGroup === "Unknown"
      ? "age unavailable"
      : county.highestPressureAgeGroup
        ? `ages ${county.highestPressureAgeGroup}`
        : null;

  let summary = `${countyName} receives ${attention} suggested recruitment attention`;

  const metricParts: string[] = [];
  if (county.childrenPerActiveProvider !== null) {
    metricParts.push(`${ratio} foster-home children per engaged provider`);
  }
  if (county.outOfCountyFosterRate !== null) {
    metricParts.push(`an ${outOfCounty} out-of-county placement rate`);
  }

  if (metricParts.length > 0) {
    summary += ` because it has ${metricParts.join(" and ")}`;
  }

  if (ageGroup) {
    summary += `. Recruitment pressure is highest for ${ageGroup}.`;
  } else {
    summary += ".";
  }

  return summary;
}

export function buildCountyPriorityExplanation(
  county: CountyMetricsDto,
  countyAgeGroups: CountyAgeMetricsDto[] = [],
  allCountyAgeGroups: CountyAgeMetricsDto[] = [],
): string {
  if (isLimitedDataCounty(county)) {
    return buildCountyExecutiveSummary(county);
  }

  const countyLabel = formatCountyName(county.county);
  const attentionLabel = formatSuggestedRecruitmentAttentionLabel(
    getSuggestedRecruitmentAttention(county),
  );
  let explanation = `${countyLabel} has ${attentionLabel.toLowerCase()} based on foster-home demand, out-of-county placement pressure, and age-group indicators relative to other eligible counties.`;

  const ageGroupSummary = buildAgeGroupPrioritySummary(
    countyAgeGroups,
    computeStatewideAgeGroupBenchmarks(allCountyAgeGroups),
  );

  if (ageGroupSummary) {
    explanation += ` ${ageGroupSummary}`;
  }

  if (county.recruitmentReasons.length === 0) {
    return explanation;
  }

  const plainReasons = county.recruitmentReasons
    .map((reason) => summarizeRecruitmentReason(reason))
    .join("; ");

  return `${explanation} Contributing indicators: ${plainReasons}.`;
}

export function buildCountyLimitations(county: CountyMetricsDto): string[] {
  const limitations = [
    "Suggested recruitment attention is a prototype planning rule. It does not prove that a county lacks enough foster homes.",
    "Licensed and engaged provider counts describe the current provider base. They are not available beds, vacancies, or guaranteed placement capacity.",
    "Published metrics never include child identifiers or child-level placement records.",
    "Out-of-county foster-home rates use current foster-home placements where the child's removal county differs from the placement county.",
    "Age-group pressure uses provider age-preference overlap rules. Matching providers are not guaranteed open placements.",
  ];

  if (isLimitedDataCounty(county)) {
    limitations.unshift(
      `${formatCountyName(county.county)} has ${getComparisonStatus(county).toLowerCase()} comparison status and is not scored for suggested recruitment attention.`,
    );
  }

  return limitations;
}

export function ageGroupSectionLabel(label: AgeGroupLabel): string {
  return label === "Unknown" ? "Age unavailable" : `Ages ${label}`;
}

export function formatCountyComparisonStatusDisplayLabel(status: ComparisonStatus): string {
  if (status === "Eligible") {
    return "Eligible for comparison";
  }

  return status;
}

export function formatOutOfCountyPlacementDisplay(
  count: number | null | undefined,
  rate: number | null | undefined,
): string {
  const parts: string[] = [];

  if (count !== null && count !== undefined) {
    parts.push(`${formatCount(count)} children`);
  }

  if (rate !== null && rate !== undefined) {
    parts.push(formatNullablePercent(rate));
  }

  if (parts.length === 0) {
    return "—";
  }

  return parts.join(" · ");
}

function providerPressureComparisonPhrase(reasons: string[]): string | null {
  if (
    reasons.some((reason) =>
      /75th percentile statewide for children per active provider/i.test(reason),
    )
  ) {
    return "higher than most comparable counties";
  }

  if (
    reasons.some((reason) => /statewide median for children per active provider/i.test(reason))
  ) {
    return "higher than the typical comparable county";
  }

  return null;
}

export function buildCountyReviewFindings(county: CountyMetricsDto): CountyReviewFinding[] {
  const findings: CountyReviewFinding[] = [];

  if (county.childrenPerActiveProvider !== null) {
    const comparisonPhrase = providerPressureComparisonPhrase(county.recruitmentReasons);
    const ratio = formatRatio(county.childrenPerActiveProvider);
    const description = comparisonPhrase
      ? `${ratio} children per engaged provider, ${comparisonPhrase}.`
      : `${ratio} children per engaged provider.`;

    findings.push({
      title: "Provider pressure",
      description,
    });
  }

  if (county.outOfCountyFosterRate !== null) {
    const rate = formatNullablePercent(county.outOfCountyFosterRate);
    findings.push({
      title: "Placement location",
      description: `${rate} of foster-home children are placed outside their home county.`,
    });
  }

  if (county.highestPressureAgeGroup && county.highestPressureAgeGroup !== "Unknown") {
    findings.push({
      title: "Age focus",
      description: `Ages ${county.highestPressureAgeGroup} have the highest pressure relative to matching engaged providers.`,
    });
  }

  return findings;
}

export function interpretAgeGroupCountyComparison(
  ratio: number | null,
  benchmark: StatewideAgeGroupBenchmark | undefined,
): AgeGroupComparisonInterpretation {
  if (ratio === null || !benchmark || benchmark.median === null) {
    return "Not calculated";
  }

  const { median, p75 } = benchmark;

  if (p75 !== null && ratio >= p75) {
    return "Far above typical";
  }

  const relativeDifference = Math.abs(ratio - median) / median;

  if (relativeDifference <= SIMILAR_TO_TYPICAL_TOLERANCE) {
    return "Similar to typical";
  }

  if (ratio > median) {
    return "Above typical";
  }

  return "Below typical";
}
