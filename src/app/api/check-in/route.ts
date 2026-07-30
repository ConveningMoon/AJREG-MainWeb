import { NextRequest, NextResponse } from "next/server";
import { checkInContactSchema } from "@/lib/checkin-schema";
import { submitCheckIn } from "@/lib/itmano";

type FormAnswer = { key: string; question: string; value: string; label: string };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { intent, answers, locale, ...contactFields } = body as {
    intent?: unknown;
    answers?: unknown;
    locale?: unknown;
  };

  // Re-validate on the server — never trust the client payload.
  if (intent !== "buy" && intent !== "sell") {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const parsed = checkInContactSchema.safeParse(contactFields);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const v = parsed.data;

  const language: "es" | "en" | "pt" = locale === "es" ? "es" : "en";

  const status = await submitCheckIn({
    first_name: v.firstName,
    last_name: v.lastName,
    email: v.email,
    phone: v.phone,
    reason: intent,
    message: v.message ? v.message.slice(0, 2000) : undefined,
    language,
    form_answers: answers as FormAnswer[],
  });

  if (status === "error") {
    return NextResponse.json({ ok: false, error: "crm" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, duplicate: status === "duplicate" });
}
