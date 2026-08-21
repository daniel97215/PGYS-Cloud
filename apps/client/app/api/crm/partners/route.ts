import { NextResponse } from "next/server";
import {
  clearSessionCookies,
  setAccessCookie,
} from "@/lib/client-api";
import { fetchForCurrentWorkspace } from "@/lib/workspace-api";

const MAX_SEARCH_LENGTH = 160;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const page = normalizePage(url.searchParams.get("page"));

  if (name.length > MAX_SEARCH_LENGTH) {
    return NextResponse.json({ message: "Recherche trop longue" }, { status: 400 });
  }

  const query = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    sort: "name",
    order: "asc",
    status: "active",
  });
  if (name) query.set("name", name);

  const result = await fetchForCurrentWorkspace(
    `/business-partner-search?${query.toString()}`,
  );

  if (!result.response.ok) {
    const response = NextResponse.json(
      { message: messageForStatus(result.response.status) },
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

function normalizePage(value: string | null) {
  const page = Number(value ?? 1);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function messageForStatus(status: number) {
  if (status === 401) return "Session expirée";
  if (status === 409) return "Aucun Workspace sélectionné";
  return "Recherche CRM indisponible";
}
