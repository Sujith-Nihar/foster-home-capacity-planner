import { CountyCollapsibleSection } from "@/components/recruitment/county-collapsible-section";

type CountyLimitationsDisclosureProps = {
  limitations: string[];
};

export function CountyLimitationsDisclosure({ limitations }: CountyLimitationsDisclosureProps) {
  return (
    <CountyCollapsibleSection
      title="Limitations and appropriate use"
      preview="These indicators support staff review. They do not measure available beds or guarantee placement capacity."
      tone="raised"
    >
      <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
        {limitations.map((limitation) => (
          <li key={limitation}>{limitation}</li>
        ))}
      </ul>
    </CountyCollapsibleSection>
  );
}
