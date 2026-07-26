import type { ProviderMetricsDto } from "@/lib/types/domain";
import { buildSuggestedStaffFollowUp } from "@/lib/providers/follow-up-prompts";

type ProviderStaffFollowUpProps = {
  provider: ProviderMetricsDto;
  preferredAgeRangeLabel: string;
};

export function ProviderStaffFollowUp({
  provider,
  preferredAgeRangeLabel,
}: ProviderStaffFollowUpProps) {
  const prompts = buildSuggestedStaffFollowUp(provider, preferredAgeRangeLabel);

  return (
    <section aria-labelledby="provider-follow-up-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="provider-follow-up-heading" className="text-lg font-semibold text-text-primary">
          Suggested staff follow-up
        </h2>
        <p className="text-sm text-text-secondary">
          Concise review prompts based on the provider&apos;s current placement, license, and
          preference information.
        </p>
      </div>

      <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-text-primary">
        {prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>

      <p className="text-sm text-text-secondary">
        These are review prompts based on the available data, not determinations about provider
        performance or availability.
      </p>
    </section>
  );
}
