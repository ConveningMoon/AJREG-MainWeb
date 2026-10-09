// Run with: node --test src/lib/hogar/crm.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildIntakeBody, type HogarSubmission } from "./crm.ts";
import { evaluate } from "./engine.ts";
import { timelineIds } from "./engine.ts";

const t = (key: string) => key;

function submission(answers: HogarSubmission["answers"]): HogarSubmission {
  return {
    name: "María Gómez",
    phoneDigits: "7575550100",
    email: "maria@ejemplo.com",
    timeline: "under_3_months",
    language: "es",
    answers,
    evaluation: evaluate(answers),
    src: "adriana-evento-familiar-2026-10-11",
    sourceUrl: "https://ajrealestateva.com/es/hogar?src=adriana-evento-familiar-2026-10-11",
    consentText: "consent sentence",
    consentAtIso: "2026-10-11T15:00:00.000Z",
  };
}

const byKey = (body: ReturnType<typeof buildIntakeBody>) =>
  Object.fromEntries(body.form_answers.map((a) => [a.key, a]));

test("contract: required fields, buyer intent, honeypot empty, +1 phone", () => {
  const body = buildIntakeBody(submission({ household: 4, income: 6000, debts: 400, savings: 15000 }), t);
  assert.equal(body.first_name, "María");
  assert.equal(body.last_name, "Gómez");
  assert.equal(body.email, "maria@ejemplo.com");
  assert.equal(body.phone, "+1 757 555 0100");
  assert.equal(body.intent, "buy");
  assert.equal(body.website, "");
  assert.equal(body.language, "es");
});

test("scoring keys use the CRM's exact codes; budget_amount is the comfortable price", () => {
  const a = byKey(buildIntakeBody(submission({ household: 4, income: 6000, debts: 400, savings: 15000 }), t));
  assert.ok((timelineIds as readonly string[]).includes(a.timeline.value));
  assert.equal(a.timeline.value, "under_3_months");
  assert.equal(a.budget_amount.value, "205000");
  assert.equal(a.cash_needed.value, "13325");
  assert.equal(a.cash_gap.value, "0");
  assert.equal(a.household_size.value, "4");
  assert.equal(a.lead_magnet.value, "family-affordability-calculator");
  assert.match(a.email_news_consent.value, /^yes\|v[^|]+\|es\|2026-10-11T/);
  assert.equal(a.email_news_consent.label, "consent sentence");
});

test("phone is optional: omitted from the body when not given", () => {
  const sub = { ...submission({ household: 2, income: 5000, debts: 0, savings: 9000 }), phoneDigits: null };
  const body = buildIntakeBody(sub, t);
  assert.equal("phone" in body, false);
  assert.equal(body.email, "maria@ejemplo.com");
});

test("tight result: no budget_amount and no misleading cash figures", () => {
  const a = byKey(buildIntakeBody(submission({ household: 3, income: 3000, debts: 1200, savings: 2000 }), t));
  assert.equal(a.budget_amount, undefined);
  assert.equal(a.cash_needed, undefined);
  assert.equal(a.cash_gap, undefined);
  // Raw inputs are still stored so the agent can see why.
  assert.equal(a.monthly_debts.value, "1200");
});
