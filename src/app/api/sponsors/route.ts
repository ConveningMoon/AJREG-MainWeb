import { NextRequest, NextResponse } from "next/server";
import { sponsorApplicationSchema } from "@/lib/sponsor-schema";
import { galaEvent, getSponsorTier } from "@/data/christmasGala";

// Sponsor applications are partners, not real-estate leads, so they do NOT go
// to ITMANO. They land in a Google Sheet through a Google Apps Script web app
// (integrations/google-apps-script/sponsor-applications.gs), which also emails
// Adriana so she can follow up. Apps Script cannot read request headers, so
// the shared secret travels in the body; it never reaches the browser.

export async function POST(req: NextRequest) {
  if (Date.now() > new Date(galaEvent.sponsorDeadline).getTime()) {
    return NextResponse.json({ ok: false, error: "closed" }, { status: 410 });
  }

  const body = await req.json().catch(() => null);
  const locale = body && typeof body === "object" && body.locale === "es" ? "es" : "en";

  // Re-validate on the server — never trust the client payload.
  const parsed = sponsorApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const v = parsed.data;

  // Honeypot filled → pretend success, store nothing.
  if (v.fax) return NextResponse.json({ ok: true });

  const webhookUrl = process.env.SPONSOR_SHEET_WEBHOOK_URL;
  const secret = process.env.SPONSOR_SHEET_SECRET;
  if (!webhookUrl || !secret) {
    console.error("[sponsors] SPONSOR_SHEET_WEBHOOK_URL / SPONSOR_SHEET_SECRET not configured");
    return NextResponse.json({ ok: false, error: "config" }, { status: 503 });
  }

  const tier = getSponsorTier(v.tier);
  const offersRaffle = tier.id !== "community";

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      // text/plain keeps Apps Script from needing a CORS/preflight story and
      // lands the raw JSON in e.postData.contents.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret,
        submittedAt: new Date().toISOString(),
        tier: tier.id,
        priceUsd: tier.priceUsd,
        businessName: v.businessName,
        industry: v.industry,
        businessLink: v.businessLink ?? "",
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        wantsVideo: tier.videoProduction ? v.wantsVideo : false,
        raffle: offersRaffle ? v.raffle : "no",
        raffleItem: offersRaffle && v.raffle !== "no" ? (v.raffleItem ?? "") : "",
        message: v.message ?? "",
        language: locale,
        sourceUrl: req.headers.get("referer") ?? "",
      }),
      redirect: "follow",
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !json?.ok) {
      console.error("[sponsors] sheet webhook rejected", res.status, json);
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
  } catch (error) {
    console.error("[sponsors] sheet webhook failed", error);
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
