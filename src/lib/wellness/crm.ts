// Home Wellness Check → ITMANO CRM (public intake channel, no secret).
//
// The browser POSTs to /api/intake/<channel>/submit, which next.config.ts
// rewrites to app.itmano.com: first-party, so no CORS and no tracker blockers.
// The CRM owns assignment, scoring and the agent notification.
//
// Event Wi-Fi is unreliable, so a lead that cannot be delivered is parked in
// localStorage and retried (backoff, max 5 attempts, and whenever the browser
// comes back online). The CRM treats "same email" as the same lead, so a
// retry that actually did land earlier cannot create a duplicate.

import { wellnessConfig } from "./config.ts";
import type { Evaluation, WellnessAnswers } from "./engine.ts";
import { cashValue, monthlyValue } from "./engine.ts";

export type Language = "en" | "es";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface CrmAnswer {
  key: string;
  question: string;
  value: string;
  label: string;
}

export interface WellnessSubmission {
  name: string;
  /** 10 US digits, no country code. */
  phoneDigits: string;
  email: string;
  language: Language;
  answers: WellnessAnswers;
  evaluation: Evaluation;
  sourceUrl: string;
  consentText: string;
  consentAtIso: string;
}

export interface IntakeBody {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  language: Language;
  intent: "buy" | "sell";
  source_url: string;
  website: "";
  form_answers: CrmAnswer[];
}

export function formatUsPhone(digits: string): string {
  return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/** Keeps the last 10 digits of whatever was typed/pasted; null if it is not a US number. */
export function normalizeUsPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

export function buildIntakeBody(sub: WellnessSubmission, t: Translate): IntakeBody {
  const { answers, evaluation } = sub;
  const topicLabels = answers.topics.map((id) => t(`q6.options.${id}`));
  const pillarsValue = (Object.keys(evaluation.pillars) as Array<keyof Evaluation["pillars"]>)
    .map((p) => `${p}:${evaluation.pillars[p]}`)
    .join("|");
  const pillarsLabel = (Object.keys(evaluation.pillars) as Array<keyof Evaluation["pillars"]>)
    .map((p) => `${t(`result.pillars.${p}`)}: ${t(`result.status.${evaluation.pillars[p]}`)}`)
    .join(" · ");

  const form_answers: CrmAnswer[] = [
    {
      key: "situation",
      question: t("q1.title"),
      value: answers.situation,
      label: t(`q1.options.${answers.situation}`),
    },
    // Scoring key + code the CRM already understands.
    {
      key: "timeline",
      question: t("q2.title"),
      value: answers.timeline,
      label: t(`q2.options.${answers.timeline}`),
    },
    {
      key: "down_payment_cash",
      question: t("q3.title"),
      value: String(cashValue[answers.cash] ?? "unsure"),
      label: t(`q3.options.${answers.cash}`),
    },
    {
      key: "comfortable_monthly_payment",
      question: t("q4.title"),
      value: String(monthlyValue[answers.monthly] ?? "unsure"),
      label: t(`q4.options.${answers.monthly}`),
    },
    {
      key: "credit_self_described",
      question: t("q5.title"),
      value: answers.credit,
      label: t(`q5.options.${answers.credit}`),
    },
    {
      key: "topics_of_interest",
      question: t("q6.title"),
      value: answers.topics.join(",") || "none",
      label: topicLabels.join(", ") || "—",
    },
  ];

  // Raw datum for the CRM to classify against the agency's own budget tiers:
  // the price the chosen comfortable payment can carry (our own calculation,
  // labelled as such). Only sent when a payment range was actually chosen.
  if (evaluation.estimate) {
    form_answers.push({
      key: "budget_amount",
      question: "Estimated purchase price the comfortable monthly payment can carry (calculated)",
      value: String(evaluation.estimate.price),
      label: `~$${evaluation.estimate.price.toLocaleString("en-US")}`,
    });
  }

  form_answers.push(
    {
      key: "wellness_pillars",
      question: "Home Wellness Check — pillar results",
      value: pillarsValue,
      label: pillarsLabel,
    },
    // Proof of consent: the exact sentence shown next to the checkbox.
    {
      key: "contact_consent",
      question: "Consent to be contacted (text, WhatsApp, call or email)",
      value: `yes|v${wellnessConfig.consentVersion}|${sub.language}|${sub.consentAtIso}`,
      label: sub.consentText,
    },
    {
      key: "lead_magnet",
      question: "Lead magnet",
      value: "home-wellness-check",
      label: `Home Wellness Check · rate ${(evaluation.rateUsed * 100).toFixed(2)}% · config ${evaluation.configVersion}`,
    },
  );

  const [firstName, ...rest] = sub.name.trim().split(/\s+/);
  const lastName = rest.join(" ");

  return {
    first_name: firstName,
    ...(lastName ? { last_name: lastName } : {}),
    email: sub.email,
    phone: formatUsPhone(sub.phoneDigits),
    language: sub.language,
    // A homeowner planning to sell scores on the seller model; everyone else as a buyer.
    intent: answers.situation === "owner" ? "sell" : "buy",
    source_url: sub.sourceUrl,
    website: "",
    form_answers,
  };
}

// ── Delivery ────────────────────────────────────────────────────────────────

const QUEUE_KEY = "ajreg.wellness.pending.v1";
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [2_000, 5_000, 15_000, 45_000, 120_000];

interface PendingLead {
  id: string;
  body: IntakeBody;
  attempts: number;
}

type PostResult = "created" | "duplicate" | "retry" | "rejected";

async function postIntake(body: IntakeBody): Promise<PostResult> {
  try {
    const response = await fetch(`/api/intake/${wellnessConfig.channelId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json().catch(() => null)) as
      | { ok?: boolean; status?: "created" | "already_submitted" }
      | null;
    if (response.ok && json?.ok) {
      return json.status === "already_submitted" ? "duplicate" : "created";
    }
    // A 4xx that is not rate limiting will not get better by retrying.
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      return "rejected";
    }
    return "retry";
  } catch {
    return "retry";
  }
}

function readQueue(): PendingLead[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingLead[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingLead[]) {
  try {
    if (queue.length) window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    else window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* private mode / quota: nothing more we can do */
  }
}

/** Stable id: same phone + same campaign + same day = same lead. */
export function idempotencyKey(phoneDigits: string, src: string, date = new Date()): string {
  const input = `${phoneDigits}|${src}|${date.toISOString().slice(0, 10)}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `wl_${(h >>> 0).toString(36)}`;
}

export function hasPending(): boolean {
  return typeof window !== "undefined" && readQueue().length > 0;
}

let flushing = false;

/** Tries every parked lead once; reschedules itself with backoff while any remain. */
export async function flushPending(onChange?: () => void): Promise<void> {
  if (typeof window === "undefined" || flushing) return;
  flushing = true;
  try {
    let queue = readQueue();
    for (const item of [...queue]) {
      const result = await postIntake(item.body);
      queue = readQueue().filter((q) => q.id !== item.id);
      if (result === "retry") {
        // At MAX_ATTEMPTS the lead stops auto-retrying; it gets a fresh run on
        // the next `online` event or page visit (see watchConnectivity).
        queue.push({ ...item, attempts: Math.min(item.attempts + 1, MAX_ATTEMPTS) });
      }
      writeQueue(queue);
    }
    const left = readQueue();
    const next = left.find((q) => q.attempts < MAX_ATTEMPTS);
    if (next) window.setTimeout(() => void flushPending(onChange), BACKOFF_MS[next.attempts] ?? 120_000);
    onChange?.();
  } finally {
    flushing = false;
  }
}

/** Sends now; if the network fails, parks the lead and keeps retrying in the background. */
export async function sendLead(
  id: string,
  body: IntakeBody,
  onChange?: () => void,
): Promise<"sent" | "queued"> {
  const result = await postIntake(body);
  if (result !== "retry") return "sent";
  const queue = readQueue().filter((q) => q.id !== id);
  queue.push({ id, body, attempts: 0 });
  writeQueue(queue);
  window.setTimeout(() => void flushPending(onChange), BACKOFF_MS[0]);
  return "queued";
}

/** Retry as soon as connectivity returns, and once on load for leftovers from an earlier visit. */
export function watchConnectivity(onChange: () => void): () => void {
  const handler = () => {
    // A lead that exhausted its attempts gets a fresh run when the network is back.
    writeQueue(readQueue().map((q) => ({ ...q, attempts: Math.min(q.attempts, MAX_ATTEMPTS - 1) })));
    void flushPending(onChange);
  };
  window.addEventListener("online", handler);
  if (hasPending()) void flushPending(onChange);
  return () => window.removeEventListener("online", handler);
}
