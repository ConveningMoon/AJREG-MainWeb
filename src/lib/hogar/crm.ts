// Family affordability calculator → ITMANO CRM (public intake channel).
//
// Builds the request body only; delivery (first-party POST, offline queue,
// retries) lives in ./intake.ts.
//
// The CRM owns assignment, scoring and the agent notification. We only have to
// speak its contract: `intent: "buy"` turns fit scoring on, and the keys below
// (`timeline`, `budget_amount`) are the ones that score. Everything else is
// stored as-is for Adriana to read.

import { hogarConfig } from "./config.ts";
import type { Evaluation, HogarAnswers, TimelineId } from "./engine.ts";
import { formatUsPhone, type CrmAnswer, type IntakeBody, type Language } from "./intake.ts";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface HogarSubmission {
  name: string;
  /** 10 US digits, no country code. Optional: the only consent collected is for news emails. */
  phoneDigits?: string | null;
  email: string;
  timeline: TimelineId;
  language: Language;
  answers: HogarAnswers;
  evaluation: Evaluation;
  src: string;
  sourceUrl: string;
  consentText: string;
  consentAtIso: string;
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export function buildIntakeBody(sub: HogarSubmission, t: Translate): IntakeBody {
  const { answers, evaluation: e } = sub;
  const { tranquilo, comodo, maximo } = e.bands;

  const form_answers: CrmAnswer[] = [
    // Scoring key + codes the CRM already understands.
    {
      key: "timeline",
      question: t("form.timeline.label"),
      value: sub.timeline,
      label: t(`form.timeline.options.${sub.timeline}`),
    },
    {
      key: "household_size",
      question: t("q1.title"),
      value: String(answers.household),
      label: t("q1.value", { count: answers.household }),
    },
    {
      key: "monthly_income",
      question: t("q2.title"),
      value: String(answers.income),
      label: money(answers.income),
    },
    {
      key: "monthly_debts",
      question: t("q3.title"),
      value: String(answers.debts),
      label: money(answers.debts),
    },
    {
      key: "savings",
      question: t("q4.title"),
      value: String(answers.savings),
      label: money(answers.savings),
    },
  ];

  // Raw datum for the CRM to classify against the agency's own budget tiers:
  // the price the comfortable payment can carry (our calculation, labelled as
  // such). Left out when the number is too small to headline.
  if (!e.tight) {
    form_answers.push({
      key: "budget_amount",
      question: "Home price the comfortable monthly payment can carry (calculated)",
      value: String(comodo.price),
      label: `~${money(comodo.price)}`,
    });
  }

  // A zero cash figure for a number we do not headline would read as "covered".
  if (!e.tight) {
    form_answers.push(
      {
        key: "cash_needed",
        question: "Cash needed for down payment + closing at the comfortable price (calculated)",
        value: String(e.cashNeeded),
        label: money(e.cashNeeded),
      },
      {
        key: "cash_gap",
        question: "Shortfall of savings vs. cash needed (0 = savings cover it)",
        value: String(e.cashGap),
        label: e.cashGap === 0 ? "Covered" : money(e.cashGap),
      },
    );
  }

  form_answers.push(
    {
      key: "affordability_range",
      question: "Calculator result — calm / comfortable / maximum (price @ monthly payment)",
      value: `tranquilo:${tranquilo.price}@${tranquilo.monthly}|comodo:${comodo.price}@${comodo.monthly}|maximo:${maximo.price}@${maximo.monthly}`,
      label: `${money(tranquilo.price)} · ${money(comodo.price)} · ${money(maximo.price)}`,
    },
    {
      key: "bedrooms_suggested",
      question: "Bedrooms households this size usually look for",
      value: e.bedrooms.min === e.bedrooms.max ? String(e.bedrooms.min) : `${e.bedrooms.min}-${e.bedrooms.max}`,
      label: e.bedrooms.min === e.bedrooms.max ? String(e.bedrooms.min) : `${e.bedrooms.min}–${e.bedrooms.max}`,
    },
    {
      key: "preferred_language",
      question: t("form.language"),
      value: sub.language,
      label: sub.language === "es" ? "Español" : "English",
    },
    {
      key: "source_detail",
      question: "Campaign source (?src=)",
      value: sub.src,
      label: `${sub.src} · event ${hogarConfig.eventDate}`,
    },
    // Proof of consent: the exact sentence shown next to the checkbox.
    // Scope is news emails only: no text, WhatsApp or call outreach is consented to.
    {
      key: "email_news_consent",
      question: "Consent to receive news emails (no advertising)",
      value: `yes|v${hogarConfig.consentVersion}|${sub.language}|${sub.consentAtIso}`,
      label: sub.consentText,
    },
    {
      key: "lead_magnet",
      question: "Lead magnet",
      value: hogarConfig.leadMagnet,
      label: `Family affordability calculator · rate ${(e.rateUsed * 100).toFixed(2)}% · config ${e.configVersion}`,
    },
  );

  const [firstName, ...rest] = sub.name.trim().split(/\s+/);
  const lastName = rest.join(" ");

  return {
    first_name: firstName,
    ...(lastName ? { last_name: lastName } : {}),
    email: sub.email,
    ...(sub.phoneDigits ? { phone: formatUsPhone(sub.phoneDigits) } : {}),
    language: sub.language,
    // Always a buyer-model score: the calculator is about what a family can afford to buy.
    intent: "buy",
    source_url: sub.sourceUrl,
    website: "",
    form_answers,
  };
}
