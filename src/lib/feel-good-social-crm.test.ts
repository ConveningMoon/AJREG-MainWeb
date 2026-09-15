import assert from "node:assert/strict";
import test from "node:test";
import { buildRaffleCrmAnswers } from "./feel-good-social-crm";
import type { FeelGoodSocialValues } from "./feel-good-social-schema";

const translate = (key: string) => key;
const base: FeelGoodSocialValues = {
  firstName: "Test",
  lastName: "Lead",
  email: "test@example.com",
  phone: "",
  intent: "buy",
  timeline: "",
  area: "",
  financing: "",
  budget: "",
  agentStatus: "",
  sellMotivation: "",
  listingStatus: "",
  website: "",
};

test("buyer answers keep ITMANO scoring keys and raw values", () => {
  const answers = buildRaffleCrmAnswers(
    {
      ...base,
      timeline: "under_3_months",
      area: "other",
      financing: "in_process",
      budget: "250000-599999",
      agentStatus: "sin_agente",
    },
    translate,
  );

  assert.deepEqual(
    answers.map(({ key, value }) => ({ key, value })),
    [
      { key: "timeline", value: "under_3_months" },
      { key: "area", value: "Otra" },
      { key: "financing", value: "in_process" },
      { key: "budget_amount", value: "250000-599999" },
      { key: "agent_status", value: "sin_agente" },
    ],
  );
});

test("seller answers use the seller scoring vocabulary", () => {
  const answers = buildRaffleCrmAnswers(
    {
      ...base,
      intent: "sell",
      timeline: "6_12_months",
      area: "virginia_beach",
      sellMotivation: "alta",
      listingStatus: "no_listado_sin_agente",
    },
    translate,
  );

  assert.deepEqual(
    answers.map(({ key, value }) => ({ key, value })),
    [
      { key: "timeline", value: "6_12_months" },
      { key: "area", value: "Virginia Beach" },
      { key: "sell_motivation", value: "alta" },
      { key: "listing_status", value: "no_listado_sin_agente" },
    ],
  );
});

test("raffle-only entries do not manufacture a real-estate intent", () => {
  const answers = buildRaffleCrmAnswers(
    { ...base, intent: "raffle_only" },
    translate,
  );

  assert.deepEqual(
    answers.map(({ key, value }) => ({ key, value })),
    [{ key: "real_estate_interest", value: "raffle_only" }],
  );
});
