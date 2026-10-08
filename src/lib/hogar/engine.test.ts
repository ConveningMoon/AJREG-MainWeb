// Run with: node --test src/lib/hogar/engine.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { LIMITS, bandMonthly, bedroomsFor, evaluate, selectSteps, validate } from "./engine.ts";

const within = (actual: number, expected: number, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= expected * tol, `${actual} not within ${tol * 100}% of ${expected}`);

test("fixture: $6,000 income, $400 debts, $15,000 saved, 4 people", () => {
  const e = evaluate({ household: 4, income: 6000, debts: 400, savings: 15000 });
  assert.equal(e.bands.tranquilo.monthly, 1500);
  assert.equal(e.bands.comodo.monthly, 1680);
  assert.equal(e.bands.maximo.monthly, 1860);
  assert.equal(e.bands.tranquilo.price, 185_000);
  assert.equal(e.bands.comodo.price, 205_000);
  assert.equal(e.bands.maximo.price, 230_000);
  within(e.cashNeeded, 13_325);
  assert.equal(e.coversCash, true);
  assert.equal(e.cashGap, 0);
  assert.deepEqual(e.bedrooms, { min: 3, max: 3 });
  assert.equal(e.tight, false);
  assert.equal(e.debtsLimit, false);
  assert.deepEqual(e.steps, ["lender", "no_new_debt", "talk"]);
});

test("debts so high the bands hit zero → tight, never a $0 headline", () => {
  const e = evaluate({ household: 3, income: 3000, debts: 1200, savings: 2000 });
  // 36% × 3000 = 1080 < 1200 debts → comfortable and tranquil bands are 0.
  assert.equal(bandMonthly(3000, 1200, "comodo"), 0);
  assert.equal(e.bands.comodo.price, 0);
  assert.equal(e.tight, true);
  assert.equal(e.debtsLimit, true);
  assert.ok(e.steps.includes("debts"));
  // No savings-gap step for a number we are not headlining.
  assert.ok(!e.steps.includes("assistance"));
});

test("zero savings → full cash gap and assistance step first", () => {
  const e = evaluate({ household: 4, income: 6000, debts: 400, savings: 0 });
  assert.equal(e.cashGap, e.cashNeeded);
  assert.equal(e.coversCash, false);
  assert.equal(e.steps[0], "assistance");
  assert.equal(e.steps.length, 3);
});

test("very high income → housing share binds, not debts", () => {
  const e = evaluate({ household: 6, income: 50_000, debts: 500, savings: 500_000 });
  assert.equal(e.bands.comodo.monthly, 14_000);
  assert.equal(e.debtsLimit, false);
  assert.equal(e.coversCash, true);
  assert.deepEqual(e.bedrooms, { min: 4, max: 4 });
});

test("limit values validate; just outside do not", () => {
  assert.deepEqual(
    validate({
      household: LIMITS.household.max,
      income: LIMITS.income.max,
      debts: LIMITS.debts.max,
      savings: LIMITS.savings.max,
    }),
    {},
  );
  assert.deepEqual(validate({ household: 1, income: 1, debts: 0, savings: 0 }), {});
  assert.deepEqual(validate({ household: 11, income: 0, debts: -1, savings: 500_001 }), {
    household: true,
    income: true,
    debts: true,
    savings: true,
  });
  assert.deepEqual(validate({ household: 3 }), { income: true, debts: true, savings: true });
});

test("bedrooms by household size", () => {
  assert.deepEqual(bedroomsFor(1), { min: 2, max: 2 });
  assert.deepEqual(bedroomsFor(2), { min: 2, max: 2 });
  assert.deepEqual(bedroomsFor(3), { min: 3, max: 3 });
  assert.deepEqual(bedroomsFor(5), { min: 4, max: 4 });
  assert.deepEqual(bedroomsFor(7), { min: 4, max: 5 });
  assert.deepEqual(bedroomsFor(10), { min: 4, max: 5 });
});

test("steps: at most 3, lender always present", () => {
  assert.deepEqual(selectSteps({ hasGap: true, debtsLimit: true }), ["assistance", "debts", "lender"]);
  assert.deepEqual(selectSteps({ hasGap: false, debtsLimit: true }), ["debts", "lender", "no_new_debt"]);
  assert.deepEqual(selectSteps({ hasGap: true, debtsLimit: false }), ["assistance", "lender", "no_new_debt"]);
});
