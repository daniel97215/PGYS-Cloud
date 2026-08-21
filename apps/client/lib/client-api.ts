import { cookies } from "next/headers";

export const CLIENT_ACCESS_COOKIE = "pgys_client_access";
export const CLIENT_REFRESH_COOKIE = "pgys_client_refresh";
export const CLIENT_WORKSPACE_COOKIE = "pgys_client_workspace";

export const clientApiBaseUrl =
  process.env.PGYS_API_URL ?? "http://localhost:3001/api/v1";

export const secureCookie = process.env.NODE_ENV === "production";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

export interface SessionApiResult {
  response: Response;
  refreshedAccessToken?: string;
}

export async function fetchWithSession(
  path: string,
  init: RequestInit = {},
): Promise<SessionApiResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CLIENT_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(CLIENT_REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return { response: new Response(null, { status: 401 }) };
  }

  if (accessToken) {
    const response = await fetchApi(path, accessToken, init);

    if (response.status !== 401 || !refreshToken) {
      return { response };
    }
  }

  if (!refreshToken) {
    return { response: new Response(null, { status: 401 }) };
  }

  const refreshResponse = await fetch(`${clientApiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  if (!refreshResponse?.ok) {
    return { response: new Response(null, { status: 401 }) };
  }

  const session = (await refreshResponse.json()) as { accessToken: string };

  return {
    response: await fetchApi(path, session.accessToken, init),
    refreshedAccessToken: session.accessToken,
  };
}

export function setAccessCookie(response: import("next/server").NextResponse, token?: string) {
  if (!token) {
    return;
  }

  response.cookies.set(CLIENT_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setSessionCookies(
  response: import("next/server").NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  setAccessCookie(response, accessToken);
  response.cookies.set(CLIENT_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearSessionCookies(response: import("next/server").NextResponse) {
  response.cookies.delete(CLIENT_ACCESS_COOKIE);
  response.cookies.delete(CLIENT_REFRESH_COOKIE);
  response.cookies.delete(CLIENT_WORKSPACE_COOKIE);
}

async function fetchApi(path: string, accessToken: string, init: RequestInit) {
  return fetch(`${clientApiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  }).catch(() => new Response(null, { status: 503 }));
}
