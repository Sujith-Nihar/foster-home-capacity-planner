import type { ProviderMetricsDto } from "@/lib/types/domain";
import { formatReportingDate } from "@/lib/utils/formatters";

export function buildSuggestedStaffFollowUp(
  provider: ProviderMetricsDto,
  preferredAgeRangeLabel: string,
): string[] {
  const prompts: string[] = [];

  if (provider.daysUntilExpiration <= 180) {
    prompts.push(
      `Confirm the provider's license-renewal plan before ${formatReportingDate(provider.licenseEndDate)}.`,
    );
  }

  if (!provider.currentlyHasPlacement) {
    prompts.push(
      "Confirm whether the provider is currently available for a foster-home placement.",
    );
  }

  prompts.push(
    `Review whether the ${preferredAgeRangeLabel} preference still reflects the provider's current interest.`,
  );

  return prompts;
}
