import { MethodologyPageContent } from "@/components/methodology/methodology-page-content";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { getMethodologyPageData } from "@/lib/data/methodology";
import { setPerformanceRoute } from "@/lib/performance/timing";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  setPerformanceRoute("/methodology");
  const data = await getMethodologyPageData();

  return (
    <div className="space-y-8">
      <PageIntroduction
        title="Methodology"
        eyebrow="DEFINITIONS AND LIMITATIONS"
        headline="Understand how metrics are defined and what they can support."
        description="Metric definitions, analytical assumptions, and known limitations for this assessment build."
      />
      <MethodologyPageContent metadata={data.metadata} sections={data.sections} />
    </div>
  );
}
