import { NextResponse } from "next/server";
import {
  clientApiBaseUrl,
  setSessionCookies,
} from "@/lib/client-api";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: Request) {
  const acceptsJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const body = acceptsJson
    ? ((await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null)
    : await readFormBody(request);

  if (
    typeof body?.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email.trim() ||
    !body.password
  ) {
    return failureResponse(request, acceptsJson, "Identifiants invalides", 400);
  }

  const apiResponse = await fetch(`${clientApiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: body.email.trim(), password: body.password }),
    cache: "no-store",
  }).catch(() => null);

  if (!apiResponse?.ok) {
    return failureResponse(
      request,
      acceptsJson,
      "Connexion impossible",
      apiResponse?.status === 401 ? 401 : 502,
    );
  }

  const session = (await apiResponse.json()) as LoginResponse;
  const response = acceptsJson
    ? NextResponse.json({ authenticated: true })
    : NextResponse.redirect(new URL("/workspaces", request.url), 303);
  setSessionCookies(response, session.accessToken, session.refreshToken);
  return response;
}

async function readFormBody(request: Request) {
  const form = await request.formData().catch(() => null);
  return form
    ? { email: form.get("email"), password: form.get("password") }
    : null;
}

function failureResponse(
  request: Request,
  acceptsJson: boolean,
  message: string,
  status: number,
) {
  if (acceptsJson) {
    return NextResponse.json({ message }, { status });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", status === 401 ? "credentials" : "service");
  return NextResponse.redirect(loginUrl, 303);
}
