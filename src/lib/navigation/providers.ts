const MAX_PROVIDER_ID = 2_147_483_647;

export function parseProviderRouteId(param: string): number | null {
  const trimmed = param.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const providerId = Number(trimmed);

  if (!Number.isSafeInteger(providerId) || providerId <= 0 || providerId > MAX_PROVIDER_ID) {
    return null;
  }

  return providerId;
}
