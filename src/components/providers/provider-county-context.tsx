import Link from "next/link";

import { formatCountyName } from "@/lib/utils/formatters";

type ProviderCountyContextProps = {
  county: string;
  countyRecruitmentOverlapSentence: string | null;
};

export function ProviderCountyContext({
  county,
  countyRecruitmentOverlapSentence,
}: ProviderCountyContextProps) {
  const countyLabel = formatCountyName(county);
  const countyHref = `/recruitment/${encodeURIComponent(county)}`;

  return (
    <section aria-labelledby="provider-county-context-heading" className="space-y-3">
      <h2 id="provider-county-context-heading" className="sr-only">
        County recruitment context
      </h2>
      {countyRecruitmentOverlapSentence ? (
        <p className="text-sm text-text-secondary">{countyRecruitmentOverlapSentence}</p>
      ) : null}
      <p className="text-sm text-text-secondary">
        <Link
          href={countyHref}
          className="font-medium text-brand-navy underline-offset-4 hover:underline"
        >
          View {countyLabel} recruitment context
        </Link>
      </p>
    </section>
  );
}
