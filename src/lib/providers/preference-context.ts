import type { MeasurableAgeGroupLabel } from "@/lib/recruitment/age-groups";
import { providerPreferenceOverlapsAgeGroup } from "@/lib/recruitment/age-groups";
import type { ProviderMetricsDto } from "@/lib/types/domain";
import { formatAgePreferenceRange } from "@/lib/utils/formatters";

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

  return `This preference overlaps the county's highest recruitment-pressure age group (ages ${highestPressureAgeGroup}).`;
}

export function formatCurrentPreferenceLabel(
  minAge: number,
  maxAge: number,
): string {
  return `Current preference: ${formatAgePreferenceRange(minAge, maxAge)}`;
}
