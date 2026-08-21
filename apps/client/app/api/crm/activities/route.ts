import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  setAccessCookie,
} from "@/lib/client-api";
import { CRM_ACTIVITY_TYPES } from "@/lib/crm";
import { fetchForCurrentWorkspace, isUuidV4 } from "@/lib/workspace-api";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const validation = validateActivity(body);

  if (!validation.valid) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const result = await fetchForCurrentWorkspace("/crm/activities", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validation.data),
  });

  if (!result.response.ok) {
    const response = NextResponse.json(
      { message: "L’activité n’a pas pu être créée" },
      { status: result.response.status },
    );
    setAccessCookie(response, result.refreshedAccessToken);
    if (result.response.status === 401) clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json(await result.response.json(), {
    status: 201,
  });
  setAccessCookie(response, result.refreshedAccessToken);
  return response;
}

function validateActivity(body: Record<string, unknown> | null):
  | { valid: false; message: string }
  | { valid: true; data: Record<string, string> } {
  if (!body || !isUuidV4(body.businessPartnerId)) {
    return { valid: false, message: "Business Partner invalide" };
  }
  if (
    typeof body.type !== "string" ||
    !CRM_ACTIVITY_TYPES.includes(
      body.type as (typeof CRM_ACTIVITY_TYPES)[number],
    )
  ) {
    return { valid: false, message: "Type d’activité invalide" };
  }
  if (
    typeof body.title !== "string" ||
    !body.title.trim() ||
    body.title.trim().length > 160
  ) {
    return { valid: false, message: "Titre d’activité invalide" };
  }
  if (
    body.contactId !== undefined &&
    body.contactId !== "" &&
    !isUuidV4(body.contactId)
  ) {
    return { valid: false, message: "Contact invalide" };
  }
  if (
    body.description !== undefined &&
    (typeof body.description !== "string" || body.description.length > 2000)
  ) {
    return { valid: false, message: "Description invalide" };
  }
  if (
    body.scheduledAt !== undefined &&
    (typeof body.scheduledAt !== "string" ||
      Number.isNaN(Date.parse(body.scheduledAt)))
  ) {
    return { valid: false, message: "Date de planification invalide" };
  }

  return {
    valid: true,
    data: {
      businessPartnerId: body.businessPartnerId,
      type: body.type,
      title: body.title.trim(),
      ...(typeof body.contactId === "string" && body.contactId
        ? { contactId: body.contactId }
        : {}),
      ...(typeof body.description === "string" && body.description.trim()
        ? { description: body.description.trim() }
        : {}),
      ...(typeof body.scheduledAt === "string"
        ? { scheduledAt: body.scheduledAt }
        : {}),
    },
  };
}
