import { MethodologyPageContent } from "@/components/methodology/methodology-page-content";
import { PageHero } from "@/components/ui/page-hero";
import { getMethodologyPageData } from "@/lib/data/methodology";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  const data = await getMethodologyPageData();

  return (
    <>
      <PageHero
        title="Methodology"
        eyebrow="Definitions and limitations"
        description="Metric definitions, analytical assumptions, and known limitations for this assessment build."
        variant="compact"
      />
      <MethodologyPageContent metadata={data.metadata} sections={data.sections} />
    </>
  );
}
