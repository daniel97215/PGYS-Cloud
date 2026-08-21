import { NextResponse } from "next/server";
import {
  PLATFORM_ACCESS_COOKIE,
  PLATFORM_REFRESH_COOKIE,
  platformApiBaseUrl,
  secureCookie,
} from "@/lib/platform-api";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;

  if (
    typeof body?.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email.trim() ||
    !body.password
  ) {
    return NextResponse.json(
      { message: "Identifiants invalides" },
      { status: 400 },
    );
  }

  const apiResponse = await fetch(`${platformApiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: body.email.trim(), password: body.password }),
    cache: "no-store",
  }).catch(() => null);

  if (!apiResponse?.ok) {
    return NextResponse.json(
      { message: "Connexion impossible" },
      { status: apiResponse?.status === 401 ? 401 : 502 },
    );
  }

  const session = (await apiResponse.json()) as LoginResponse;
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(PLATFORM_ACCESS_COOKIE, session.accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: 15 * 60,
  });
  response.cookies.set(PLATFORM_REFRESH_COOKIE, session.refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
