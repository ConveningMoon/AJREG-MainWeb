// Delivery of a /hogar lead to the ITMANO public intake channel.
//
// The browser POSTs to /api/intake/<channel>/submit, which next.config.ts
// rewrites to app.itmano.com: first-party, so no CORS and no tracker blockers.
// The CRM owns assignment, scoring and the agent notification.
//
// Event Wi-Fi is unreliable, so a lead that cannot be delivered is parked in
// localStorage and retried (backoff, max 5 attempts, and whenever the browser
// comes back online). The CRM treats "same email" as the same lead, so a retry
// that actually did land earlier cannot create a duplicate.
//
// Self-contained on purpose (own queue key, own types): the Home Wellness Check
// has a similar module, but the two lead magnets ship and change independently.

import { hogarConfig } from "./config.ts";

export type Language = "en" | "es";

export interface CrmAnswer {
  key: string;
  question: string;
  value: string;
  label: string;
}

export interface IntakeBody {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  language: Language;
  intent: "buy" | "sell" | "invest";
  source_url: string;
  website: "";
  form_answers: CrmAnswer[];
}

/** Keeps the last 10 digits of whatever was typed/pasted; null if it is not a US number. */
export function normalizeUsPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

export function formatUsPhone(digits: string): string {
  return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/** Live "(xxx) xxx-xxxx" mask for the phone input. */
export function formatPhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return d;
}

/** Stable id: same phone + same campaign + same day = same lead. */
export function idempotencyKey(phoneDigits: string, src: string, date = new Date()): string {
  const input = `${phoneDigits}|${src}|${date.toISOString().slice(0, 10)}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `hg_${(h >>> 0).toString(36)}`;
}

// ── Queue ───────────────────────────────────────────────────────────────────

const QUEUE_KEY = "ajreg.hogar.pending.v1";
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
    const response = await fetch(`/api/intake/${hogarConfig.channelId}/submit`, {
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
    const next = readQueue().find((q) => q.attempts < MAX_ATTEMPTS);
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
