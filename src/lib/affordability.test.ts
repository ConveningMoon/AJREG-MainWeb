// Run with: node --test src/lib/affordability.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  affordabilityConfig,
  cashNeeded,
  estimateFromMonthly,
  monthlyCostPerDollar,
  priceFromMonthly,
  roundDownTo,
} from "./affordability.ts";

const within = (actual: number, expected: number, tol = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= expected * tol,
    `${actual} not within ${tol * 100}% of ${expected}`,
  );

test("k (monthly cost per $1) ≈ 0.008003 with default config", () => {
  within(monthlyCostPerDollar(affordabilityConfig), 0.008003);
});

test("roundDownTo never rounds up", () => {
  assert.equal(roundDownTo(187_499, 5000), 185_000);
  assert.equal(roundDownTo(185_000, 5000), 185_000);
  assert.equal(roundDownTo(4_999, 5000), 0);
});

test("$1,500/mo carries ~$187k → $185k, needing ~$12,025", () => {
  within(priceFromMonthly(1500), 187_400);
  const { price, cash } = estimateFromMonthly(1500);
  assert.equal(price, 185_000);
  within(cash, 12_025);
});

test("$2,150/mo carries ~$268.6k → $265k, needing ~$17,225", () => {
  within(priceFromMonthly(2150), 268_600);
  const { price, cash } = estimateFromMonthly(2150);
  assert.equal(price, 265_000);
  within(cash, 17_225);
});

test("cashNeeded is the FHA down payment plus closing costs (6.5%)", () => {
  within(cashNeeded(185_000), 12_025);
});
