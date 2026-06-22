import { z } from "zod";

// Shared between the client form (React Hook Form + zodResolver) and the
// server action that forwards the lead to the ITMANO CRM. Error messages are
// i18n keys *relative to the `contact` namespace* (e.g. "validation.email"),
// resolved with the `contact` translator at render time.

export const contactIntents = ["compra", "vende", "invierte"] as const;
export const contactLanguages = ["es", "en", "pt"] as const;

export type ContactIntent = (typeof contactIntents)[number];
export type ContactLanguage = (typeof contactLanguages)[number];

const isEmail = (value: string) => z.email().safeParse(value).success;

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "validation.firstName"),
  lastName: z.string().trim().min(1, "validation.lastName"),
  email: z
    .string()
    .trim()
    .min(1, "validation.emailRequired")
    .refine(isEmail, "validation.emailInvalid"),
  phone: z.string().trim().optional(),
  language: z.enum(contactLanguages),
  intent: z.enum(contactIntents, { error: "validation.intent" }),
  message: z.string().trim().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
