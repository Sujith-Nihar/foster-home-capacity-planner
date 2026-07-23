import { COUNTY_NORMALIZATION_MAP } from "@/config/metrics";

const MAX_COUNTY_NAME_LENGTH = 64;
const INVALID_COUNTY_PATTERN = /[<>%\\/\0]/;

export function normalizeRouteCounty(param: string): string | null {
  if (!param.trim()) {
    return null;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(param).trim();
  } catch {
    return null;
  }

  if (!decoded || decoded.length > MAX_COUNTY_NAME_LENGTH || INVALID_COUNTY_PATTERN.test(decoded)) {
    return null;
  }

  return COUNTY_NORMALIZATION_MAP[decoded] ?? decoded;
}
