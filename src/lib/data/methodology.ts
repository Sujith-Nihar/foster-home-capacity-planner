import { getDatasetMetadata } from "@/lib/data/overview";

export async function getMethodologyPageData() {
  const metadata = await getDatasetMetadata();

  return {
    metadata,
  };
}
