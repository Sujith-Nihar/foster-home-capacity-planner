import { PageIntroSpacing } from "@/components/layout/page-intro-spacing";
import { MethodologyPageContent } from "@/components/methodology/methodology-page-content";
import { PageIntroduction } from "@/components/ui/page-introduction";
import { getMethodologyPageData } from "@/lib/data/methodology";
import { buildMethodologyIntroDescription } from "@/lib/methodology/page-content";
import { setPerformanceRoute } from "@/lib/performance/timing";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  setPerformanceRoute("/methodology");
  const data = await getMethodologyPageData();

  return (
    <PageIntroSpacing className="space-y-6">
      <PageIntroduction
        className="page-intro--methodology"
        eyebrow="Definitions and appropriate use"
        headline="Understand what the metrics mean and how planning categories are created."
        description={buildMethodologyIntroDescription()}
      />
      <MethodologyPageContent metadata={data.metadata} />
    </PageIntroSpacing>
  );
}
