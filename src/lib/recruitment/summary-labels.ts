/**
 * Short plain-language labels for recruitment table summaries.
 * Full methodological wording remains on the county detail page.
 */
export function summarizeRecruitmentReason(reason: string): string {
  const normalized = reason.trim();

  const patterns: Array<{ match: RegExp; label: string }> = [
    {
      match: /75th percentile statewide for out-of-county/i,
      label: "High out-of-county placement rate",
    },
    {
      match: /75th percentile statewide for children per active provider/i,
      label: "High children-per-provider ratio",
    },
    {
      match: /75th percentile statewide for age-group pressure/i,
      label: "Elevated age-group pressure",
    },
    {
      match: /statewide median for out-of-county/i,
      label: "Above-median out-of-county rate",
    },
    {
      match: /statewide median for children per active provider/i,
      label: "Above-median children-per-provider ratio",
    },
    {
      match: /statewide median for age-group pressure/i,
      label: "Above-median age-group pressure",
    },
    {
      match: /approach expiration within 90 days/i,
      label: "Many licenses expiring soon",
    },
    {
      match: /Below statewide comparison thresholds/i,
      label: "Below comparison thresholds",
    },
    {
      match: /does not meet minimum volume rules/i,
      label: "Limited comparison data",
    },
    {
      match: /High children-per-active-provider ratio/i,
      label: "High children-per-provider ratio",
    },
  ];

  for (const { match, label } of patterns) {
    if (match.test(normalized)) {
      return label;
    }
  }

  if (normalized.length <= 72) {
    return normalized;
  }

  return normalized.slice(0, 69).trimEnd() + "…";
}

export function formatAdditionalFactorsLabel(additionalCount: number): string {
  if (additionalCount <= 0) {
    return "";
  }
  const noun = additionalCount === 1 ? "factor" : "factors";
  return `+${additionalCount} additional ${noun}`;
}
