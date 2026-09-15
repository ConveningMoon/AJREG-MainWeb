import { z } from "zod";

export const feelGoodSocialInterests = [
  "workouts",
  "games",
  "vendors",
  "food",
  "everything",
] as const;

const isEmail = (value: string) => z.email().safeParse(value).success;

export const feelGoodSocialSchema = z.object({
  firstName: z.string().trim().min(1, "validation.firstName"),
  lastName: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .min(1, "validation.emailRequired")
    .refine(isEmail, "validation.emailInvalid"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => !value || value.replace(/\D/g, "").length >= 7,
      "validation.phoneInvalid",
    )
    .optional(),
  interest: z
    .union([z.enum(feelGoodSocialInterests), z.literal("")])
    .optional(),
  website: z.string().optional(),
});

export type FeelGoodSocialValues = z.infer<typeof feelGoodSocialSchema>;
