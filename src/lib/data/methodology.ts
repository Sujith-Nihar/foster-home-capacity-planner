import { getDatasetMetadata } from "@/lib/data/overview";
import { buildMethodologySections } from "@/lib/methodology/sections";

export async function getMethodologyPageData() {
  const [metadata, sections] = await Promise.all([
    getDatasetMetadata(),
    Promise.resolve(buildMethodologySections()),
  ]);

  return {
    metadata,
    sections,
  };
}
