import { NextResponse } from "next/server";

const limits = { name: 100, company: 120, email: 160, phone: 30, need: 80, message: 2000 } as const;

function read(formData: FormData, key: keyof typeof limits) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, limits[key]) : "";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  if (formData.get("website")) return NextResponse.json({ ok: true });
  const contact = {
    name: read(formData, "name"), company: read(formData, "company"),
    email: read(formData, "email"), phone: read(formData, "phone"),
    need: read(formData, "need"), message: read(formData, "message"),
  };
  if (!contact.name || !contact.email.includes("@") || !contact.need || !contact.message) {
    return NextResponse.json({ error: "INVALID_CONTACT_REQUEST" }, { status: 400 });
  }
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({ error: "CONTACT_SERVICE_NOT_CONFIGURED" }, { status: 503 });
  const response = await fetch(webhookUrl, {
    method: "POST", headers: { "content-type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ source: "pgys.fr", submittedAt: new Date().toISOString(), ...contact }),
  });
  if (!response.ok) return NextResponse.json({ error: "CONTACT_DELIVERY_FAILED" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
