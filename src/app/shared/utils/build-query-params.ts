export type QueryParamValue = string | number | boolean;

export function buildQueryParams(params: Record<string, unknown>): Record<string, QueryParamValue> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Record<string, QueryParamValue>;
}
