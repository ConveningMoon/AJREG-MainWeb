import type { FeelGoodSocialValues } from "@/lib/feel-good-social-schema";

export type RaffleCrmAnswer = {
  key: string;
  question: string;
  value: string;
  label: string;
};

type Translate = (key: string) => string;

const AREA_VALUES = {
  virginia_beach: "Virginia Beach",
  north_carolina: "North Carolina",
  other: "Otra",
} as const;

function answer(
  t: Translate,
  key: string,
  questionKey: string,
  value: string | undefined,
  labelKey: string,
): RaffleCrmAnswer | null {
  return value
    ? { key, question: t(questionKey), value, label: t(labelKey) }
    : null;
}

export function buildRaffleCrmAnswers(
  values: FeelGoodSocialValues,
  t: Translate,
): RaffleCrmAnswer[] {
  if (values.intent === "raffle_only") {
    return [
      {
        key: "real_estate_interest",
        question: t("form.intent"),
        value: "raffle_only",
        label: t("form.intents.raffle_only"),
      },
    ];
  }

  const answers: Array<RaffleCrmAnswer | null> = [
    answer(
      t,
      "timeline",
      "form.timeline",
      values.timeline || undefined,
      `form.timelines.${values.timeline}`,
    ),
    values.area
      ? {
          key: "area",
          question: t("form.area"),
          value: AREA_VALUES[values.area],
          label: t(`form.areas.${values.area}`),
        }
      : null,
  ];

  if (values.intent === "buy" || values.intent === "invest") {
    answers.push(
      answer(
        t,
        "financing",
        "form.financing",
        values.financing || undefined,
        `form.financingOptions.${values.financing}`,
      ),
      answer(
        t,
        "budget_amount",
        "form.budget",
        values.budget || undefined,
        `form.budgets.${values.budget}`,
      ),
      answer(
        t,
        "agent_status",
        "form.agentStatus",
        values.agentStatus || undefined,
        `form.agentStatuses.${values.agentStatus}`,
      ),
    );
  }

  if (values.intent === "sell") {
    answers.push(
      answer(
        t,
        "sell_motivation",
        "form.sellMotivation",
        values.sellMotivation || undefined,
        `form.sellMotivations.${values.sellMotivation}`,
      ),
      answer(
        t,
        "listing_status",
        "form.listingStatus",
        values.listingStatus || undefined,
        `form.listingStatuses.${values.listingStatus}`,
      ),
    );
  }

  return answers.filter((item): item is RaffleCrmAnswer => item !== null);
}
