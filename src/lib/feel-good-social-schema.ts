import { z } from "zod";

export const raffleIntents = ["buy", "sell", "invest", "raffle_only"] as const;
export const raffleTimelines = [
  "under_3_months",
  "3_6_months",
  "6_12_months",
  "over_12_explorando",
] as const;
export const raffleAreas = ["virginia_beach", "north_carolina", "other"] as const;
export const raffleFinancing = ["cash", "preapproved", "in_process", "not_started"] as const;
export const raffleBudgets = ["250000", "250000-599999", "600000"] as const;
export const raffleAgentStatuses = ["sin_agente", "con_agente"] as const;
export const raffleSellMotivations = ["alta", "media", "baja"] as const;
export const raffleListingStatuses = [
  "no_listado_sin_agente",
  "ya_listado_con_agente",
] as const;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal("")]).optional();

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
  intent: z.enum(raffleIntents, { error: "validation.intent" }),
  timeline: optionalEnum(raffleTimelines),
  area: optionalEnum(raffleAreas),
  financing: optionalEnum(raffleFinancing),
  budget: optionalEnum(raffleBudgets),
  agentStatus: optionalEnum(raffleAgentStatuses),
  sellMotivation: optionalEnum(raffleSellMotivations),
  listingStatus: optionalEnum(raffleListingStatuses),
  website: z.string().optional(),
});

export type FeelGoodSocialValues = z.infer<typeof feelGoodSocialSchema>;
