export const PLATFORM_ACCESS_COOKIE = "pgys_platform_access";
export const PLATFORM_REFRESH_COOKIE = "pgys_platform_refresh";

export const platformApiBaseUrl =
  process.env.PGYS_API_URL ?? "http://localhost:3001/api/v1";

export const secureCookie = process.env.NODE_ENV === "production";
