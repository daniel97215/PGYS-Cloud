import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  setAccessCookie,
} from "@/lib/client-api";
import { fetchForCurrentWorkspace, isUuidV4 } from "@/lib/workspace-api";

interface RouteContext {
  params: Promise<{ activityId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { activityId } = await context.params;

  if (!isUuidV4(activityId)) {
    return NextResponse.json({ message: "Activité invalide" }, { status: 400 });
  }

  const result = await fetchForCurrentWorkspace(
    `/crm/activities/${activityId}/complete`,
    { method: "POST" },
  );

  if (!result.response.ok) {
    const response = NextResponse.json(
      { message: "L’activité n’a pas pu être terminée" },
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
