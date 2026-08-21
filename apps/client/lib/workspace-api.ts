import { cookies } from "next/headers";
import { CLIENT_WORKSPACE_COOKIE, fetchWithSession } from "./client-api";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function fetchForCurrentWorkspace(
  path: string,
  init: RequestInit = {},
) {
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get(CLIENT_WORKSPACE_COOKIE)?.value;

  if (!workspaceId || !UUID_V4.test(workspaceId)) {
    return {
      response: new Response(null, { status: 409 }),
      workspaceId: null,
      refreshedAccessToken: undefined,
    };
  }

  const accessCheck = await fetchWithSession(`/workspaces/${workspaceId}`);

  if (!accessCheck.response.ok) {
    return {
      ...accessCheck,
      workspaceId,
    };
  }

  const result = await fetchWithSession(
    `/workspaces/${workspaceId}${path}`,
    init,
  );
  return {
    ...result,
    refreshedAccessToken:
      result.refreshedAccessToken ?? accessCheck.refreshedAccessToken,
    workspaceId,
  };
}

export function isUuidV4(value: unknown): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}
