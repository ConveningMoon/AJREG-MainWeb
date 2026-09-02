import { z } from "zod";

// Client-side validation for the newsletter subscription form. Error messages
// are i18n keys *relative to the `newsletter` namespace*, resolved with that
// translator at render time — same convention as contact-schema.ts.
//
// `consent` is a boolean the visitor has to tick: the CRM rejects a newsletter
// subscription without proof of consent (GDPR art. 7.1), and that proof is the
// literal sentence shown next to the checkbox, sent as `consent_text`.

const isEmail = (value: string) => z.email().safeParse(value).success;

export const newsletterSchema = z.object({
  firstName: z.string().trim().min(1, "validation.firstName"),
  email: z
    .string()
    .trim()
    .min(1, "validation.emailRequired")
    .refine(isEmail, "validation.emailInvalid"),
  consent: z.literal(true, { error: "validation.consent" }),
  // Honeypot: hidden with CSS (never type="hidden", which bots fill in too).
  // Anything here means a bot, and the CRM discards the submission silently.
  website: z.string().optional(),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
