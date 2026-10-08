// Run with: node --test src/lib/wellness/engine.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  affordabilityConfig,
  cashNeeded,
  estimateFromMonthly,
  monthlyCostPerDollar,
  priceFromMonthly,
  roundDownTo,
} from "../affordability.ts";
import {
  clarityPillar,
  creditPillar,
  evaluate,
  savingsPillar,
  type WellnessAnswers,
} from "./engine.ts";

const within = (actual: number, expected: number, tol = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= expected * tol,
    `${actual} not within ${tol * 100}% of ${expected}`,
  );

const base: WellnessAnswers = {
  situation: "rent",
  timeline: "3_6_months",
  cash: "5to15k",
  monthly: "1200to1800",
  credit: "good",
  topics: [],
};

test("k (monthly cost per $1) ≈ 0.008003 with default config", () => {
  within(monthlyCostPerDollar(affordabilityConfig), 0.008003);
});

test("roundDownTo never rounds up", () => {
  assert.equal(roundDownTo(187_499, 5000), 185_000);
  assert.equal(roundDownTo(185_000, 5000), 185_000);
  assert.equal(roundDownTo(4_999, 5000), 0);
});

test("fixture A: $5–15k cash, $1,200–1,800/mo → $185k, $12,025, ratio .83, almost", () => {
  within(priceFromMonthly(1500), 187_400);
  const { price, cash } = estimateFromMonthly(1500);
  assert.equal(price, 185_000);
  within(cash, 12_025);
  const s = savingsPillar("5to15k", "1200to1800");
  within(s.ratio!, 0.83);
  assert.equal(s.status, "almost");
});

test("fixture B: $15–30k cash, $1,800–2,500/mo → $265k, $17,225, ratio 1.31, strong", () => {
  within(priceFromMonthly(2150), 268_600);
  const { price, cash } = estimateFromMonthly(2150);
  assert.equal(price, 265_000);
  within(cash, 17_225);
  const s = savingsPillar("15to30k", "1800to2500");
  within(s.ratio!, 1.31);
  assert.equal(s.status, "strong");
});

test("fixture C: <$5k cash, payment unsure → reference $1,500, ratio .21, start; number pillar start", () => {
  const s = savingsPillar("lt5k", "unsure");
  within(cashNeeded(185_000), 12_025);
  within(s.ratio!, 0.21, 0.03);
  assert.equal(s.status, "start");
  const ev = evaluate({ ...base, cash: "lt5k", monthly: "unsure" });
  assert.equal(ev.pillars.number, "start");
  assert.equal(ev.estimate, null);
});

test("cash 'not sure' is always start with no ratio", () => {
  const s = savingsPillar("unsure", "2500plus");
  assert.equal(s.status, "start");
  assert.equal(s.ratio, null);
});

test("credit: all four self-descriptions", () => {
  assert.equal(creditPillar("excellent"), "strong");
  assert.equal(creditPillar("good"), "strong");
  assert.equal(creditPillar("improving"), "almost");
  assert.equal(creditPillar("unchecked"), "start");
});

test("clarity: 0 and 5 topics, and the boundaries", () => {
  assert.equal(clarityPillar(0), "strong");
  assert.equal(clarityPillar(1), "strong");
  assert.equal(clarityPillar(2), "almost");
  assert.equal(clarityPillar(3), "almost");
  assert.equal(clarityPillar(4), "start");
  assert.equal(clarityPillar(5), "start");
});

test("overall summary follows the strong count", () => {
  const four = evaluate({ ...base, cash: "30plus", monthly: "1200to1800", credit: "excellent" });
  assert.equal(four.strongCount, 4);
  assert.equal(four.overall, "four");

  const none = evaluate({
    ...base,
    cash: "unsure",
    monthly: "unsure",
    credit: "unchecked",
    topics: ["process", "downPayment", "hiddenCosts", "credit", "where"],
  });
  assert.equal(none.strongCount, 0);
  assert.equal(none.overall, "none");
});

test("steps: always exactly 3, unique, savings first when savings is weak", () => {
  const ev = evaluate({ ...base, cash: "lt5k", credit: "unchecked" });
  assert.equal(ev.steps.length, 3);
  assert.equal(new Set(ev.steps).size, 3);
  assert.deepEqual(ev.steps, ["savings_vhda", "savings_fha", "credit_start"]);
});

test("steps: strong everywhere still yields 3 (topics, FHA fact, then generic)", () => {
  const ev = evaluate({
    ...base,
    cash: "30plus",
    credit: "excellent",
    topics: ["where"],
  });
  assert.equal(ev.strongCount, 4);
  assert.equal(ev.steps.length, 3);
  assert.equal(ev.steps[0], "clarity_where");
});

test("hidden-costs topic has no step of its own (the card covers it)", () => {
  const ev = evaluate({
    ...base,
    cash: "30plus",
    credit: "excellent",
    topics: ["hiddenCosts"],
  });
  assert.deepEqual(ev.steps, ["savings_fha", "clarity_process", "generic_talk"]);
});

test("estimate is present only when a payment range was chosen", () => {
  assert.equal(evaluate({ ...base, monthly: "unsure" }).estimate, null);
  const ev = evaluate({ ...base, monthly: "1200to1800" });
  assert.equal(ev.estimate?.price, 185_000);
  assert.equal(ev.rateUsed, 0.0675);
});
