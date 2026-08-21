import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CLIENT_REFRESH_COOKIE,
  clearSessionCookies,
  clientApiBaseUrl,
} from "@/lib/client-api";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(CLIENT_REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${clientApiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => null);
  }

  const isForm = request.headers.get("content-type")?.includes("application/x-www-form-urlencoded") ?? false;
  const response = isForm
    ? NextResponse.redirect(new URL("/login", request.url), 303)
    : new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}
