// Pillar scoring + next-step selection for the Home Wellness Check.
// Pure (no React, no I/O) so it can be unit-tested against the agreed fixtures.

import {
  affordabilityConfig,
  cashNeeded,
  estimateFromMonthly,
  type AffordabilityConfig,
} from "../affordability.ts";

export const situationIds = ["rent", "family", "owner", "other"] as const;
export const timelineIds = [
  "under_3_months",
  "3_6_months",
  "6_12_months",
  "over_12_explorando",
] as const;
export const cashIds = ["lt5k", "5to15k", "15to30k", "30plus", "unsure"] as const;
export const monthlyIds = ["lt1200", "1200to1800", "1800to2500", "2500plus", "unsure"] as const;
export const creditIds = ["unchecked", "improving", "good", "excellent"] as const;
export const topicIds = ["process", "downPayment", "hiddenCosts", "credit", "where"] as const;

export type SituationId = (typeof situationIds)[number];
export type TimelineId = (typeof timelineIds)[number];
export type CashId = (typeof cashIds)[number];
export type MonthlyId = (typeof monthlyIds)[number];
export type CreditId = (typeof creditIds)[number];
export type TopicId = (typeof topicIds)[number];

export interface WellnessAnswers {
  situation: SituationId;
  timeline: TimelineId;
  cash: CashId;
  monthly: MonthlyId;
  credit: CreditId;
  topics: TopicId[];
}

/** Representative dollar value of each range (the midpoint-ish figure agreed for the maths). */
export const cashValue: Record<CashId, number | null> = {
  lt5k: 2500,
  "5to15k": 10000,
  "15to30k": 22500,
  "30plus": 40000,
  unsure: null,
};
export const monthlyValue: Record<MonthlyId, number | null> = {
  lt1200: 1000,
  "1200to1800": 1500,
  "1800to2500": 2150,
  "2500plus": 3000,
  unsure: null,
};

/** Reference payment used for the Savings pillar when the person is not sure. */
export const REFERENCE_MONTHLY = 1500;

export type PillarId = "savings" | "credit" | "number" | "clarity";
export type PillarStatus = "strong" | "almost" | "start";
export const pillarOrder: readonly PillarId[] = ["savings", "credit", "number", "clarity"];

export type StepId =
  | "savings_vhda"
  | "savings_fha"
  | "credit_start"
  | "credit_almost"
  | "number_start"
  | "clarity_process"
  | "clarity_where"
  | "generic_talk";

export type Overall = "four" | "three" | "some" | "none";

export interface Evaluation {
  pillars: Record<PillarId, PillarStatus>;
  strongCount: number;
  overall: Overall;
  /** Savings ratio actually used (cash available / cash needed), null when cash is unknown. */
  savingsRatio: number | null;
  /** Present only when a comfortable payment was chosen. */
  estimate: { monthly: number; price: number; cash: number } | null;
  steps: StepId[];
  rateUsed: number;
  configVersion: string;
}

export function savingsPillar(
  cash: CashId,
  monthly: MonthlyId,
  config: AffordabilityConfig = affordabilityConfig,
): { status: PillarStatus; ratio: number | null } {
  const cashAmount = cashValue[cash];
  if (cashAmount === null) return { status: "start", ratio: null };
  const monthlyAmount = monthlyValue[monthly] ?? REFERENCE_MONTHLY;
  const { price } = estimateFromMonthly(monthlyAmount, config);
  const ratio = cashAmount / cashNeeded(price, config);
  const status: PillarStatus = ratio >= 1 ? "strong" : ratio >= 0.5 ? "almost" : "start";
  return { status, ratio };
}

export function creditPillar(credit: CreditId): PillarStatus {
  if (credit === "good" || credit === "excellent") return "strong";
  if (credit === "improving") return "almost";
  return "start";
}

export function numberPillar(monthly: MonthlyId): PillarStatus {
  return monthly === "unsure" ? "start" : "strong";
}

export function clarityPillar(topicCount: number): PillarStatus {
  if (topicCount <= 1) return "strong";
  if (topicCount <= 3) return "almost";
  return "start";
}

export function overallFor(strongCount: number): Overall {
  if (strongCount >= 4) return "four";
  if (strongCount === 3) return "three";
  if (strongCount >= 1) return "some";
  return "none";
}

/**
 * The 3 highest-impact steps, taken from the weakest pillars in priority order
 * (Savings → Credit → Your number → Clarity) and from the Q6 topics. Hidden
 * costs has no step of its own: it is the always-visible card.
 */
export function selectSteps(
  pillars: Record<PillarId, PillarStatus>,
  topics: readonly TopicId[],
): StepId[] {
  const picked: StepId[] = [];
  const add = (id: StepId) => {
    if (!picked.includes(id)) picked.push(id);
  };
  const creditStep = (): StepId =>
    pillars.credit === "almost" ? "credit_almost" : "credit_start";

  for (const pillar of pillarOrder) {
    const status = pillars[pillar];
    if (status === "strong") continue;
    if (pillar === "savings") {
      add("savings_vhda");
      add("savings_fha");
    } else if (pillar === "credit") {
      add(creditStep());
    } else if (pillar === "number") {
      add("number_start");
    } else {
      for (const topic of topics) {
        if (topic === "process") add("clarity_process");
        if (topic === "where") add("clarity_where");
        if (topic === "downPayment") add("savings_vhda");
        if (topic === "credit") add(creditStep());
      }
    }
  }

  // Strong everywhere (or too few weak spots): fill from what they asked about,
  // then the always-true FHA fact, the process walkthrough, and a neutral
  // invitation to talk.
  for (const topic of topics) {
    if (topic === "process") add("clarity_process");
    if (topic === "where") add("clarity_where");
    if (topic === "downPayment") add("savings_vhda");
    if (topic === "credit") add(creditStep());
  }
  add("savings_fha");
  add("clarity_process");
  add("generic_talk");

  return picked.slice(0, 3);
}

export function evaluate(
  answers: WellnessAnswers,
  config: AffordabilityConfig = affordabilityConfig,
): Evaluation {
  const savings = savingsPillar(answers.cash, answers.monthly, config);
  const pillars: Record<PillarId, PillarStatus> = {
    savings: savings.status,
    credit: creditPillar(answers.credit),
    number: numberPillar(answers.monthly),
    clarity: clarityPillar(answers.topics.length),
  };
  const strongCount = pillarOrder.filter((p) => pillars[p] === "strong").length;

  const monthly = monthlyValue[answers.monthly];
  const estimate =
    monthly === null ? null : { monthly, ...estimateFromMonthly(monthly, config) };

  return {
    pillars,
    strongCount,
    overall: overallFor(strongCount),
    savingsRatio: savings.ratio,
    estimate,
    steps: selectSteps(pillars, answers.topics),
    rateUsed: config.rate30,
    configVersion: config.version,
  };
}
