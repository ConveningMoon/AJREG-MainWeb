// Family affordability calculator ("¿Cuánto puede pagar tu familia con
// tranquilidad?"). Pure (no React, no I/O) so it can be unit-tested against the
// agreed fixture. The financial model itself — rate, FHA down payment, premiums,
// tax, insurance, closing — lives in lib/affordability.ts and is shared with
// the Home Wellness Check; this module only adds the payment bands (DTI) and
// the household-size guidance.

import {
  affordabilityConfig,
  cashNeeded,
  priceFromMonthly,
  roundDownTo,
  type AffordabilityConfig,
} from "../affordability.ts";

/** Codes the CRM understands for the `timeline` scoring key. */
export const timelineIds = [
  "under_3_months",
  "3_6_months",
  "6_12_months",
  "over_12_explorando",
] as const;
export type TimelineId = (typeof timelineIds)[number];

export const LIMITS = {
  household: { min: 1, max: 10 },
  income: { min: 1, max: 50_000 },
  debts: { min: 0, max: 20_000 },
  savings: { min: 0, max: 500_000 },
} as const;

/**
 * Below this comfortable price the number stops being useful as a headline
 * (a "$25,000 house" is not a plan). The screen switches to the "tight, but
 * there are steps" message instead of showing a discouraging figure.
 */
export const MIN_MEANINGFUL_PRICE = 50_000;

/** Housing-payment ceilings as a share of gross income, plus the total-debt ceiling for each band. */
export const BANDS = {
  tranquilo: { housing: 0.25, total: 0.36 },
  comodo: { housing: 0.28, total: 0.36 },
  maximo: { housing: 0.31, total: 0.43 },
} as const;

export type BandId = keyof typeof BANDS;
export const bandOrder: readonly BandId[] = ["tranquilo", "comodo", "maximo"];

export interface HogarAnswers {
  household: number;
  /** Gross monthly household income. */
  income: number;
  /** Monthly debt payments (car, cards, loans) — not rent or utilities. */
  debts: number;
  savings: number;
}

export interface Band {
  /** Monthly housing payment (P&I + MIP + tax + insurance) this band allows. */
  monthly: number;
  /** Purchase price that payment carries, rounded DOWN to $5,000. */
  price: number;
}

export type NextStepId = "assistance" | "debts" | "lender" | "no_new_debt" | "talk";

export interface Evaluation {
  bands: Record<BandId, Band>;
  /** True when the comfortable band is too small to headline (see MIN_MEANINGFUL_PRICE). */
  tight: boolean;
  /** Cash for down payment + closing at the (already rounded) comfortable price. */
  cashNeeded: number;
  /** Positive when savings fall short of `cashNeeded`, else 0. */
  cashGap: number;
  coversCash: boolean;
  /** Debts are what limits the comfortable band, not the income share. */
  debtsLimit: boolean;
  bedrooms: { min: number; max: number };
  steps: NextStepId[];
  rateUsed: number;
  configVersion: string;
}

export interface FieldErrors {
  household?: true;
  income?: true;
  debts?: true;
  savings?: true;
}

export function validate(a: Partial<HogarAnswers>): FieldErrors {
  const bad = (v: number | undefined, { min, max }: { min: number; max: number }) =>
    v === undefined || !Number.isFinite(v) || v < min || v > max;
  const errors: FieldErrors = {};
  if (bad(a.household, LIMITS.household)) errors.household = true;
  if (bad(a.income, LIMITS.income)) errors.income = true;
  if (bad(a.debts, LIMITS.debts)) errors.debts = true;
  if (bad(a.savings, LIMITS.savings)) errors.savings = true;
  return errors;
}

/** Monthly housing budget for one band; never negative. */
export function bandMonthly(income: number, debts: number, band: BandId): number {
  const { housing, total } = BANDS[band];
  return Math.max(0, Math.min(housing * income, total * income - debts));
}

export function bedroomsFor(household: number): { min: number; max: number } {
  if (household <= 2) return { min: 2, max: 2 };
  if (household <= 4) return { min: 3, max: 3 };
  if (household <= 6) return { min: 4, max: 4 };
  return { min: 4, max: 5 };
}

export function selectSteps(flags: {
  hasGap: boolean;
  debtsLimit: boolean;
}): NextStepId[] {
  const picked: NextStepId[] = [];
  if (flags.hasGap) picked.push("assistance");
  if (flags.debtsLimit) picked.push("debts");
  picked.push("lender", "no_new_debt", "talk");
  return picked.slice(0, 3);
}

export function evaluate(
  answers: HogarAnswers,
  config: AffordabilityConfig = affordabilityConfig,
): Evaluation {
  const band = (id: BandId): Band => {
    const monthly = bandMonthly(answers.income, answers.debts, id);
    return { monthly: Math.round(monthly), price: roundDownTo(priceFromMonthly(monthly, config), 5000) };
  };
  const bands = { tranquilo: band("tranquilo"), comodo: band("comodo"), maximo: band("maximo") };

  // Cash is computed on the rounded price the person actually sees, so the
  // numbers on screen agree with each other.
  const cash = cashNeeded(bands.comodo.price, config);
  const cashGap = Math.max(0, Math.round(cash - answers.savings));
  const tight = bands.comodo.price < MIN_MEANINGFUL_PRICE;
  // Debts are the binding constraint when 36 % of income minus debts is below the 28 % housing share.
  const debtsLimit = BANDS.comodo.total * answers.income - answers.debts < BANDS.comodo.housing * answers.income;

  return {
    bands,
    tight,
    cashNeeded: Math.round(cash),
    cashGap,
    coversCash: cashGap === 0,
    debtsLimit,
    bedrooms: bedroomsFor(answers.household),
    steps: selectSteps({ hasGap: !tight && cashGap > 0, debtsLimit }),
    rateUsed: config.rate30,
    configVersion: config.version,
  };
}
