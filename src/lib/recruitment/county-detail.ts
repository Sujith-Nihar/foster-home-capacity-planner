import { AGE_GROUPS, RECRUITMENT_MINIMUM_VOLUME } from "@/config/metrics";
import type { AgeGroupLabel } from "@/config/metrics";
import type { CountyAgeMetricsDto, CountyMetricsDto } from "@/lib/types/domain";
import { formatCountyName, formatRecruitmentPriorityLabel } from "@/lib/utils/formatters";

export function orderCountyAgeGroups(
  ageGroups: CountyAgeMetricsDto[],
): CountyAgeMetricsDto[] {
  const byLabel = new Map(ageGroups.map((group) => [group.ageGroup, group]));
  const orderedLabels = AGE_GROUPS.map((group) => group.label);

  return orderedLabels
    .map((label) => byLabel.get(label))
    .filter((group): group is CountyAgeMetricsDto => group !== undefined);
}

export function buildCountyPriorityExplanation(county: CountyMetricsDto): string {
  const countyLabel = formatCountyName(county.county);

  if (county.recruitmentPriority === "Limited data") {
    return `${countyLabel} does not meet minimum volume rules for comparative recruitment planning priority. Counties need at least ${RECRUITMENT_MINIMUM_VOLUME.currentFosterHomeChildren} foster-home children and ${RECRUITMENT_MINIMUM_VOLUME.activeProviders} active providers before statewide comparison applies.`;
  }

  const priorityLabel = formatRecruitmentPriorityLabel(county.recruitmentPriority);
  const introduction = `${countyLabel} is classified as ${priorityLabel} at the reporting date. This is a planning signal based on foster-home demand, out-of-county placement pressure, and age-group indicators relative to other eligible counties—not a proven shortage estimate.`;

  if (county.recruitmentReasons.length === 0) {
    return introduction;
  }

  return `${introduction} Documented factors: ${county.recruitmentReasons.join("; ")}.`;
}

export function buildCountyLimitations(county: CountyMetricsDto): string[] {
  const limitations = [
    "Recruitment priority is a planning indicator. It does not prove that a county lacks enough foster homes.",
    "Licensed and active provider counts describe the current provider base. They are not available beds, vacancies, or guaranteed placement capacity.",
    "Published metrics never include child identifiers or child-level placement records.",
    "Out-of-county foster-home rates use current foster-home placements where the child's removal county differs from the placement county.",
    "Age-group pressure uses provider age-preference overlap rules. Matching providers are not guaranteed open placements.",
  ];

  if (county.recruitmentPriority === "Limited data") {
    limitations.unshift(
      `${formatCountyName(county.county)} is shown separately from comparative rankings because it does not meet minimum volume thresholds.`,
    );
  }

  return limitations;
}

export function ageGroupSectionLabel(label: AgeGroupLabel): string {
  return label === "Unknown" ? "Unknown age group" : `Ages ${label}`;
}
