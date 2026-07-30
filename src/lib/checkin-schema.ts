import { z } from "zod";

// Contact-info step of the check-in wizard. Shared between the client form
// (React Hook Form + zodResolver) and the API route re-validation. Error
// messages are i18n keys *relative to the `checkIn` namespace*
// (e.g. "validation.email"), resolved with the `checkIn` translator.
//
// Phone is required here (unlike the main Contact Us form) — the check-in
// flow is for warm leads the team already has a relationship with, and the
// phone field is submitted as just the local number; the +1 US prefix is
// fixed in the UI and prepended server-side.

export const checkInContactSchema = z.object({
  firstName: z.string().trim().min(1, "validation.firstName"),
  lastName: z.string().trim().min(1, "validation.lastName"),
  email: z
    .string()
    .trim()
    .min(1, "validation.emailRequired")
    .refine((v) => z.email().safeParse(v).success, "validation.emailInvalid"),
  phone: z.string().trim().min(7, "validation.phoneRequired"),
  message: z.string().trim().optional(),
});

export type CheckInContactValues = z.infer<typeof checkInContactSchema>;
