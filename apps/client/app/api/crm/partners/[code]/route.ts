import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  setAccessCookie,
} from "@/lib/client-api";
import type {
  BusinessPartner,
  BusinessPartnerContact,
  CrmActivity,
} from "@/lib/crm";
import { fetchForCurrentWorkspace } from "@/lib/workspace-api";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;

  if (!code.trim() || code.length > 80) {
    return NextResponse.json({ message: "Code invalide" }, { status: 400 });
  }

  const partnerResult = await fetchForCurrentWorkspace(
    `/customers/${encodeURIComponent(code)}`,
  );

  if (!partnerResult.response.ok) {
    return errorResponse(
      partnerResult.response.status,
      partnerResult.refreshedAccessToken,
    );
  }

  const partner = (await partnerResult.response.json()) as BusinessPartner;
  const [contactsResult, activitiesResult] = await Promise.all([
    fetchForCurrentWorkspace(
      `/customers/${partner.id}/business-partner-contacts`,
    ),
    fetchForCurrentWorkspace("/crm/activities"),
  ]);

  const failed = [contactsResult, activitiesResult].find(
    ({ response }) => !response.ok,
  );
  if (failed) {
    return errorResponse(
      failed.response.status,
      failed.refreshedAccessToken ?? partnerResult.refreshedAccessToken,
    );
  }

  const contacts =
    (await contactsResult.response.json()) as BusinessPartnerContact[];
  const activities = (await activitiesResult.response.json()) as CrmActivity[];
  const response = NextResponse.json({
    partner,
    contacts: contacts.filter(({ isActive }) => isActive),
    activities: activities.filter(
      ({ businessPartnerId }) => businessPartnerId === partner.id,
    ),
  });
  setAccessCookie(
    response,
    activitiesResult.refreshedAccessToken ??
      contactsResult.refreshedAccessToken ??
      partnerResult.refreshedAccessToken,
  );
  return response;
}

function errorResponse(status: number, refreshedAccessToken?: string) {
  const response = NextResponse.json(
    {
      message:
        status === 404
          ? "Business Partner introuvable"
          : status === 409
            ? "Aucun Workspace sélectionné"
            : "Fiche CRM indisponible",
    },
    { status },
  );
  setAccessCookie(response, refreshedAccessToken);
  if (status === 401) clearSessionCookies(response);
  return response;
}
