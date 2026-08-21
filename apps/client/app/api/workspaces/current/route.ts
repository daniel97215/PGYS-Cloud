import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CLIENT_WORKSPACE_COOKIE,
  clearSessionCookies,
  fetchWithSession,
  setAccessCookie,
} from "@/lib/client-api";

export async function GET() {
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get(CLIENT_WORKSPACE_COOKIE)?.value;

  if (!workspaceId) {
    return NextResponse.json({ message: "Aucun Workspace sélectionné" }, { status: 409 });
  }

  const result = await fetchWithSession(`/workspaces/${workspaceId}`);

  if (!result.response.ok) {
    const response = NextResponse.json(
      { message: result.response.status === 503 ? "Service indisponible" : "Workspace indisponible" },
      { status: result.response.status },
    );
    setAccessCookie(response, result.refreshedAccessToken);
    if (result.response.status === 401) clearSessionCookies(response);
    if (result.response.status === 403 || result.response.status === 404) {
      response.cookies.delete(CLIENT_WORKSPACE_COOKIE);
    }
    return response;
  }

  const response = NextResponse.json(await result.response.json());
  setAccessCookie(response, result.refreshedAccessToken);
  return response;
}
