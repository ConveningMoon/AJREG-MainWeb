// Affordability math shared by the lead magnets (/hogar).
//
// Pure functions + one config object: no UI, no I/O, so it is unit-testable and
// safe to import from server or client code. Change the numbers in
// `affordabilityConfig` (and bump `version`) — nothing else needs to move.
//
// Model: FHA 30-year fixed. A monthly payment is converted into the purchase
// price it can carry (P&I on the loan incl. the financed upfront premium, plus
// annual MIP, property tax and homeowners insurance), and into the cash needed
// at the table (FHA minimum down payment + estimated closing costs).

export interface AffordabilityConfig {
  /** Bump when any number below changes; stored with each lead for traceability. */
  version: string;
  /** 30-year fixed rate, percent as a decimal fraction (0.0675 = 6.75 %). */
  rate30: number;
  /** FHA minimum down payment (3.5 % with a 580+ score). */
  fhaDownPct: number;
  /** FHA upfront mortgage insurance premium, financed into the loan. */
  ufmipPct: number;
  /** FHA annual MIP, charged monthly on the base loan (real range 0.15–0.75 %). */
  annualMipPct: number;
  /** Effective annual property tax (Virginia average; varies by locality). */
  propertyTaxPct: number;
  /** Annual homeowners insurance as a share of price. */
  insurancePct: number;
  /** Estimated closing costs as a share of price. */
  closingPct: number;
  termYears: number;
  /** ISO date the reference numbers were last checked. Shown in the result footer. */
  lastUpdated: string;
  sources: readonly string[];
}

export const affordabilityConfig: AffordabilityConfig = {
  version: "2026-10-08",
  rate30: 0.0675,
  fhaDownPct: 0.035,
  ufmipPct: 0.0175,
  annualMipPct: 0.0055,
  propertyTaxPct: 0.0078,
  insurancePct: 0.0065,
  closingPct: 0.03,
  termYears: 30,
  lastUpdated: "2026-10-08",
  sources: [
    "Freddie Mac PMMS (30-yr fixed, last verified 6.71% on 2026-09-03)",
    "HUD/FHA: 3.5% down at 580+, 1.75% UFMIP, annual MIP 0.15–0.75%",
    "Tax Foundation: Virginia effective property tax rate ≈ 0.78%",
  ],
};

/**
 * Total monthly housing cost (P&I + MIP + tax + insurance) per $1 of price.
 * With the default config this is ≈ 0.008003.
 */
export function monthlyCostPerDollar(config: AffordabilityConfig = affordabilityConfig): number {
  const loanBase = 1 - config.fhaDownPct;
  const loanTotal = loanBase * (1 + config.ufmipPct);
  const r = config.rate30 / 12;
  const n = config.termYears * 12;
  const pi = r === 0 ? loanTotal / n : (loanTotal * r) / (1 - Math.pow(1 + r, -n));
  const mip = (loanBase * config.annualMipPct) / 12;
  const tax = config.propertyTaxPct / 12;
  const ins = config.insurancePct / 12;
  return pi + mip + tax + ins;
}

/** Unrounded purchase price a monthly payment can carry. */
export function priceFromMonthly(
  monthly: number,
  config: AffordabilityConfig = affordabilityConfig,
): number {
  return monthly / monthlyCostPerDollar(config);
}

/** Cash needed at closing for a price: FHA down payment + closing costs. */
export function cashNeeded(
  price: number,
  config: AffordabilityConfig = affordabilityConfig,
): number {
  return price * (config.fhaDownPct + config.closingPct);
}

/** Rounds DOWN to a multiple of `step` (never promise more house than the math supports). */
export function roundDownTo(value: number, step = 5000): number {
  return Math.floor(value / step) * step;
}

/** Convenience: monthly payment → rounded price and the cash it implies. */
export function estimateFromMonthly(
  monthly: number,
  config: AffordabilityConfig = affordabilityConfig,
): { price: number; cash: number } {
  const price = roundDownTo(priceFromMonthly(monthly, config), 5000);
  return { price, cash: cashNeeded(price, config) };
}
