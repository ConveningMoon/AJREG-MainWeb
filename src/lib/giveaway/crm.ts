// Good For Her giveaway → ITMANO CRM (public intake channel, no secret).
//
// The browser POSTs to /api/intake/<channel>/submit, which next.config.ts
// rewrites to app.itmano.com: first-party, so no CORS and no tracker blockers.
// The CRM owns assignment, scoring and the agent notification.
//
// Event Wi-Fi is unreliable, so an entry that cannot be delivered is parked in
// localStorage and retried (backoff, max 5 attempts, and whenever the browser
// comes back online). The CRM treats "same email" as the same lead, so a retry
// that actually did land earlier cannot create a duplicate.

import { giveawayConfig } from "./config.ts";

export type Language = "en" | "es";

export interface CrmAnswer {
  key: string;
  question: string;
  value: string;
  label: string;
}

export interface GiveawaySubmission {
  name: string;
  /** 10 US digits, no country code. Optional. */
  phoneDigits: string | null;
  email: string;
  language: Language;
  sourceUrl: string;
  /** The exact sentence shown next to the checkbox. */
  consentText: string;
  consentAtIso: string;
}

export interface IntakeBody {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  language: Language;
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

export function buildIntakeBody(sub: GiveawaySubmission): IntakeBody {
  const [firstName, ...rest] = sub.name.trim().split(/\s+/);
  const lastName = rest.join(" ");

  return {
    first_name: firstName,
    ...(lastName ? { last_name: lastName } : {}),
    email: sub.email,
    ...(sub.phoneDigits ? { phone: formatUsPhone(sub.phoneDigits) } : {}),
    language: sub.language,
    source_url: sub.sourceUrl,
    website: "",
    form_answers: [
      // Proof of consent: the exact sentence the person agreed to.
      {
        key: "email_news_consent",
        question: "Consent to receive news by email",
        value: `yes|v${giveawayConfig.consentVersion}|${sub.language}|${sub.consentAtIso}`,
        label: sub.consentText,
      },
      {
        key: "lead_magnet",
        question: "Lead magnet",
        value: "good-for-her-giveaway",
        label: "Good For Her Giveaway by Melany Valencia",
      },
    ],
  };
}

// ── Delivery ────────────────────────────────────────────────────────────────

const QUEUE_KEY = "ajreg.giveaway.pending.v1";
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [2_000, 5_000, 15_000, 45_000, 120_000];

interface PendingEntry {
  id: string;
  body: IntakeBody;
  attempts: number;
}

type PostResult = "created" | "duplicate" | "retry" | "rejected";

async function postIntake(body: IntakeBody): Promise<PostResult> {
  try {
    const response = await fetch(`/api/intake/${giveawayConfig.channelId}/submit`, {
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

function readQueue(): PendingEntry[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingEntry[]) {
  try {
    if (queue.length) window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    else window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* private mode / quota: nothing more we can do */
  }
}

/** Stable id: same email + same campaign = same entry. */
export function idempotencyKey(email: string, src: string): string {
  const input = `${email.trim().toLowerCase()}|${src}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `ge_${(h >>> 0).toString(36)}`;
}

export function hasPending(): boolean {
  return typeof window !== "undefined" && readQueue().length > 0;
}

let flushing = false;

/** Tries every parked entry once; reschedules itself with backoff while any remain. */
export async function flushPending(onChange?: () => void): Promise<void> {
  if (typeof window === "undefined" || flushing) return;
  flushing = true;
  try {
    let queue = readQueue();
    for (const item of [...queue]) {
      const result = await postIntake(item.body);
      queue = readQueue().filter((q) => q.id !== item.id);
      if (result === "retry") {
        // At MAX_ATTEMPTS the entry stops auto-retrying; it gets a fresh run on
        // the next `online` event or page visit (see watchConnectivity).
        queue.push({ ...item, attempts: Math.min(item.attempts + 1, MAX_ATTEMPTS) });
      }
      writeQueue(queue);
    }
    const next = readQueue().find((q) => q.attempts < MAX_ATTEMPTS);
    if (next) window.setTimeout(() => void flushPending(onChange), BACKOFF_MS[next.attempts] ?? 120_000);
    onChange?.();
  } finally {
    flushing = false;
  }
}

/** Sends now; if the network fails, parks the entry and keeps retrying in the background. */
export async function sendEntry(
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
    // An entry that exhausted its attempts gets a fresh run when the network is back.
    writeQueue(readQueue().map((q) => ({ ...q, attempts: Math.min(q.attempts, MAX_ATTEMPTS - 1) })));
    void flushPending(onChange);
  };
  window.addEventListener("online", handler);
  if (hasPending()) void flushPending(onChange);
  return () => window.removeEventListener("online", handler);
}
