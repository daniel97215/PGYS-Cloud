import { NextRequest, NextResponse } from "next/server";
import {
  PLATFORM_ACCESS_COOKIE,
  PLATFORM_REFRESH_COOKIE,
  platformApiBaseUrl,
  secureCookie,
} from "@/lib/platform-api";

const ALLOWED_QUERY_KEYS = [
  "search",
  "action",
  "workspaceId",
  "actorId",
  "targetType",
  "from",
  "to",
  "page",
  "pageSize",
] as const;

export async function GET(request: NextRequest) {
  const query = new URLSearchParams();

  for (const key of ALLOWED_QUERY_KEYS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }

  let accessToken: string | null | undefined = request.cookies.get(
    PLATFORM_ACCESS_COOKIE,
  )?.value;
  let apiResponse = accessToken ? await fetchAudit(accessToken, query) : null;

  if (!apiResponse || apiResponse.status === 401) {
    const refreshToken = request.cookies.get(PLATFORM_REFRESH_COOKIE)?.value;
    if (!refreshToken) return unauthorizedResponse();

    accessToken = await refreshAccessToken(refreshToken);
    if (!accessToken) return unauthorizedResponse();
    apiResponse = await fetchAudit(accessToken, query);
  }

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        message:
          apiResponse.status === 403
            ? "Accès opérateur PGYS requis"
            : "Impossible de charger le journal d’audit",
      },
      { status: apiResponse.status === 403 ? 403 : 502 },
    );
  }

  if (!accessToken) return unauthorizedResponse();

  const response = NextResponse.json(await apiResponse.json());
  response.cookies.set(PLATFORM_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: 15 * 60,
  });
  return response;
}

function fetchAudit(accessToken: string, query: URLSearchParams) {
  const suffix = query.size ? `?${query.toString()}` : "";
  return fetch(`${platformApiBaseUrl}/platform/audit${suffix}`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => new Response(null, { status: 503 }));
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${platformApiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) return null;
  const body = (await response.json()) as { accessToken?: unknown };
  return typeof body.accessToken === "string" ? body.accessToken : null;
}

function unauthorizedResponse() {
  const response = NextResponse.json(
    { message: "Authentification requise" },
    { status: 401 },
  );
  response.cookies.delete(PLATFORM_ACCESS_COOKIE);
  response.cookies.delete(PLATFORM_REFRESH_COOKIE);
  return response;
}
