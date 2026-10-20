import { z } from "zod";

export const GALA_RSVP_CHANNEL = "chn_aylnf8qdyyhz";

export const galaRsvpSchema = z.object({
  firstName: z.string().trim().min(1, "required").max(120, "tooLong"),
  lastName: z.string().trim().max(120, "tooLong"),
  email: z.string().trim().pipe(z.email("emailInvalid").max(254, "tooLong")),
  phone: z.string().trim().max(40, "tooLong"),
  extraGuests: z.enum(["0", "1"], { error: "guestInvalid" }),
  website: z.string(),
});

export type GalaRsvpValues = z.infer<typeof galaRsvpSchema>;

export function buildGalaRsvpPayload(
  values: GalaRsvpValues,
  locale: "en" | "es",
  sourceUrl: string,
  t: (key: string) => string,
) {
  const parsed = galaRsvpSchema.parse(values);
  if (parsed.website) throw new Error("Honeypot must be empty");
  return {
    first_name: parsed.firstName,
    last_name: parsed.lastName || undefined,
    email: parsed.email,
    phone: parsed.phone || undefined,
    language: locale,
    source_url: sourceUrl,
    website: "",
    form_answers: [
      { key: "extra_guests", question: t("form.extraGuests"), value: parsed.extraGuests, label: t(`form.guests.${parsed.extraGuests}`) },
      { key: "total_attendees", question: t("form.totalLabel"), value: String(Number(parsed.extraGuests) + 1), label: t(`form.totals.${parsed.extraGuests}`) },
    ],
  };
}
