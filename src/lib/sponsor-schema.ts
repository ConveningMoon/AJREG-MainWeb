import { z } from "zod";
import { sponsorTierIds } from "@/data/christmasGala";

// Gala Christmas Party sponsor application. Shared between the client form
// (React Hook Form + zodResolver) and the /api/sponsors re-validation. Error
// messages are i18n keys relative to the `christmasGala.form` namespace.

export const sponsorIndustries = [
  "mortgage",
  "insurance",
  "homeServices",
  "legal",
  "food",
  "health",
  "retail",
  "other",
] as const;

export const raffleChoices = ["yes", "maybe", "no"] as const;

const isEmail = (value: string) => z.email().safeParse(value).success;

export const sponsorApplicationSchema = z.object({
  tier: z.enum(sponsorTierIds, { error: "validation.tier" }),
  businessName: z.string().trim().min(1, "validation.businessName").max(120),
  industry: z.enum(sponsorIndustries, { error: "validation.industry" }),
  businessLink: z.string().trim().max(200).optional(),
  firstName: z.string().trim().min(1, "validation.firstName").max(80),
  lastName: z.string().trim().min(1, "validation.lastName").max(80),
  email: z
    .string()
    .trim()
    .min(1, "validation.emailRequired")
    .refine(isEmail, "validation.emailInvalid"),
  // Required: Adriana follows up personally with every applicant.
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, "validation.phone"),
  wantsVideo: z.boolean(),
  raffle: z.enum(raffleChoices),
  raffleItem: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
  // Honeypot — must stay empty. Named so autofill never fills it.
  fax: z.string().optional(),
});

export type SponsorApplicationValues = z.infer<typeof sponsorApplicationSchema>;
