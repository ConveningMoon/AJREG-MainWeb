import { NextRequest, NextResponse } from "next/server";
import { getResourceByAgent } from "@/data/resources";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentSlug, locale, firstName, lastName, email, phone, form_answers } = body;

  if (!firstName || !lastName || !email || !agentSlug) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const resource = getResourceByAgent(agentSlug);
  if (!resource) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const channelId = process.env[resource.itmanoChannelEnv];
  if (!channelId) {
    // Channel not configured yet — return success so UX doesn't break in dev
    console.warn(`[resources] Channel env ${resource.itmanoChannelEnv} not set. Skipping CRM submit.`);
    return NextResponse.json({ ok: true, skipped: true });
  }

  const payload = {
    first_name: firstName,
    last_name:  lastName,
    email,
    phone:      phone ?? undefined,
    language:   (locale === "es" ? "es" : locale === "pt" ? "pt" : "en") as "es" | "en" | "pt",
    intent:     "compra" as const,
    form_answers,
  };

  const res = await fetch(
    `https://app.itmano.com/api/intake/${channelId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (res.status === 409) return NextResponse.json({ ok: true, duplicate: true });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: "crm_error", detail: text }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
