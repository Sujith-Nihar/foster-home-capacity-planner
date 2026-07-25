import { COUNTY_NORMALIZATION_MAP } from "@/config/metrics";

const COUNTY_SUFFIX_PATTERN = /\bcounty\b/gi;

export function normalizeCountySearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(COUNTY_SUFFIX_PATTERN, "")
    .replace(/[.\-'"]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function normalizeCountyNameForSearch(countyName: string): string {
  const mapped = COUNTY_NORMALIZATION_MAP[countyName] ?? countyName;
  return normalizeCountySearchQuery(mapped);
}

export function countyMatchesSearch(countyName: string, searchQuery: string): boolean {
  const normalizedSearch = normalizeCountySearchQuery(searchQuery);
  if (!normalizedSearch) {
    return true;
  }

  const normalizedCounty = normalizeCountyNameForSearch(countyName);
  return normalizedCounty.includes(normalizedSearch);
}

export function filterCountiesBySearch<T extends { county: string }>(
  counties: T[],
  searchQuery: string | undefined,
): T[] {
  if (!searchQuery?.trim()) {
    return counties;
  }

  return counties.filter((county) => countyMatchesSearch(county.county, searchQuery));
}

export function filterCountySuggestions(
  counties: string[],
  searchQuery: string,
  limit = 6,
): string[] {
  const normalizedSearch = normalizeCountySearchQuery(searchQuery);
  if (!normalizedSearch) {
    return counties.slice(0, limit);
  }

  return counties
    .filter((county) => countyMatchesSearch(county, searchQuery))
    .slice(0, limit);
}
