import { NextRequest, NextResponse } from "next/server";
import { contactSchema, type ContactIntent } from "@/lib/contact-schema";
import { submitContact } from "@/lib/itmano";

// Maps the form's intent values to the CRM webhook's `reason` enum.
const reasonByIntent: Record<ContactIntent, "buy" | "sell" | "invest"> = {
  compra: "buy",
  vende: "sell",
  invierte: "invest",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Re-validate on the server — never trust the client payload.
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const v = parsed.data;

  const status = await submitContact({
    first_name: v.firstName,
    last_name: v.lastName || undefined,
    email: v.email,
    phone: v.phone || undefined,
    reason: reasonByIntent[v.intent],
    message: v.message ? v.message.slice(0, 2000) : undefined,
    language: v.language,
  });

  if (status === "error") {
    return NextResponse.json({ ok: false, error: "crm" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, duplicate: status === "duplicate" });
}
