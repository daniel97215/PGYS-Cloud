import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  fetchWithSession,
  setAccessCookie,
} from "@/lib/client-api";

export async function GET() {
  const result = await fetchWithSession("/workspaces");

  if (!result.response.ok) {
    const response = NextResponse.json(
      { message: result.response.status === 503 ? "Service indisponible" : "Session expirée" },
      { status: result.response.status },
    );
    setAccessCookie(response, result.refreshedAccessToken);
    if (result.response.status === 401) clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json(await result.response.json());
  setAccessCookie(response, result.refreshedAccessToken);
  return response;
}
