import type { MeasurableAgeGroupLabel } from "@/lib/recruitment/age-groups";
import { providerPreferenceOverlapsAgeGroup } from "@/lib/recruitment/age-groups";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { formatAgePreferenceRange, formatCountyName } from "@/lib/utils/formatters";

export function buildProviderPreferenceContext(
  provider: ProviderMetricsDto,
  highestPressureAgeGroup: MeasurableAgeGroupLabel | null,
): string | null {
  if (!highestPressureAgeGroup) {
    return null;
  }

  if (
    !providerPreferenceOverlapsAgeGroup(
      provider.minAge,
      provider.maxAge,
      highestPressureAgeGroup,
    )
  ) {
    return null;
  }

  return buildAgeGroupOverlapNote(provider.county, highestPressureAgeGroup);
}

export function formatPreferredAgeRangeLabel(minAge: number, maxAge: number): string {
  return formatAgePreferenceRange(minAge, maxAge);
}

/** @deprecated Use formatPreferredAgeRangeLabel. */
export function formatCurrentPreferenceLabel(minAge: number, maxAge: number): string {
  return `Current preference: ${formatAgePreferenceRange(minAge, maxAge)}`;
}

export function buildAgeGroupOverlapNote(
  county: string,
  highestPressureAgeGroup: MeasurableAgeGroupLabel,
): string {
  return `Overlaps ${formatCountyName(county)}'s highest-pressure age group: Ages ${highestPressureAgeGroup}.`;
}

export function buildCountyRecruitmentOverlapSentence(hasOverlap: boolean): string | null {
  if (!hasOverlap) {
    return null;
  }

  return "The provider's preferred age range overlaps the county's highest-pressure recruitment age group.";
}

export function providerHasAgeGroupOverlap(
  provider: ProviderMetricsDto,
  highestPressureAgeGroup: MeasurableAgeGroupLabel | null,
): boolean {
  if (!highestPressureAgeGroup) {
    return false;
  }

  return providerPreferenceOverlapsAgeGroup(
    provider.minAge,
    provider.maxAge,
    highestPressureAgeGroup,
  );
}
