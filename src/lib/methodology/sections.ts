import {
  IMPORTANT_THINGS_TO_KNOW,
  METHODOLOGY_NAV_ITEMS,
  METHODOLOGY_SECTION_IDS,
} from "@/lib/methodology/page-content";

export const METHODOLOGY_CALLOUTS = IMPORTANT_THINGS_TO_KNOW;
export const REQUIRED_METHODOLOGY_PHRASES = IMPORTANT_THINGS_TO_KNOW;

export type MethodologySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export { METHODOLOGY_SECTION_IDS, METHODOLOGY_NAV_ITEMS };

export function buildMethodologySections(): MethodologySection[] {
  return METHODOLOGY_NAV_ITEMS.map((item) => ({
    id: item.id,
    title: item.label,
    paragraphs: [],
  }));
}
