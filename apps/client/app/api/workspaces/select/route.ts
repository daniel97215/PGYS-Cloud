import { NextResponse } from "next/server";
import {
  CLIENT_WORKSPACE_COOKIE,
  clearSessionCookies,
  fetchWithSession,
  secureCookie,
  setAccessCookie,
} from "@/lib/client-api";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const acceptsJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const body = acceptsJson
    ? ((await request.json().catch(() => null)) as { workspaceId?: unknown } | null)
    : await readFormBody(request);

  if (typeof body?.workspaceId !== "string" || !UUID_V4.test(body.workspaceId)) {
    return NextResponse.json({ message: "Workspace invalide" }, { status: 400 });
  }

  const result = await fetchWithSession(`/workspaces/${body.workspaceId}`);

  if (!result.response.ok) {
    const response = NextResponse.json(
      { message: result.response.status === 403 ? "Accès refusé" : "Workspace indisponible" },
      { status: result.response.status },
    );
    setAccessCookie(response, result.refreshedAccessToken);
    if (result.response.status === 401) clearSessionCookies(response);
    return response;
  }

  const workspace = await result.response.json();
  const response = acceptsJson
    ? NextResponse.json(workspace)
    : NextResponse.redirect(new URL("/", request.url), 303);
  setAccessCookie(response, result.refreshedAccessToken);
  response.cookies.set(CLIENT_WORKSPACE_COOKIE, body.workspaceId, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}

async function readFormBody(request: Request) {
  const form = await request.formData().catch(() => null);
  return form ? { workspaceId: form.get("workspaceId") } : null;
}
