"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { createTranslator } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  CreditCard,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  PiggyBank,
  Share2,
  Wallet,
} from "lucide-react";
import { affordabilityConfig } from "@/lib/affordability";
import { sanitizeSrc, wellnessConfig } from "@/lib/wellness/config";
import {
  cashIds,
  creditIds,
  evaluate,
  monthlyIds,
  pillarOrder,
  situationIds,
  timelineIds,
  topicIds,
  type Evaluation,
  type PillarId,
  type PillarStatus,
  type StepId,
  type TopicId,
  type WellnessAnswers,
} from "@/lib/wellness/engine";
import {
  buildIntakeBody,
  hasPending,
  idempotencyKey,
  normalizeUsPhone,
  sendLead,
  watchConnectivity,
  type ContactMethod,
  type Language,
} from "@/lib/wellness/crm";
import { setTrackContext, track } from "@/lib/wellness/track";
import { EqualHousingMark } from "./EqualHousingMark";
import styles from "./Wellness.module.css";

type Messages = Record<string, unknown>;

interface Props {
  /** Only the `wellness` slice of each locale, so the quiz can switch language without navigating. */
  copy: Record<Language, Messages>;
  initialLang: Language;
}

type Screen = "welcome" | 1 | 2 | 3 | 4 | 5 | 6 | "form" | "result";

const SINGLE_QUESTIONS = [
  { n: 1, field: "situation", ids: situationIds },
  { n: 2, field: "timeline", ids: timelineIds },
  { n: 3, field: "cash", ids: cashIds },
  { n: 4, field: "monthly", ids: monthlyIds },
  { n: 5, field: "credit", ids: creditIds },
] as const;

const PILLAR_ICON: Record<PillarId, typeof PiggyBank> = {
  savings: PiggyBank,
  credit: CreditCard,
  number: Wallet,
  clarity: Compass,
};

const STATUS_STYLE: Record<PillarStatus, string> = {
  strong: "bg-[#e3efe6] text-[#25563a]",
  almost: "bg-[#f6ecd5] text-[#775816]",
  start: "bg-[#e2eaf0] text-[#2f4f66]",
};

const METHODS: readonly ContactMethod[] = ["text", "whatsapp", "call", "email"];
const LANG_KEY = "ajreg.wellness.lang";

const subscribeNever = () => () => {};

function readLangPreference(): Language | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "en" || fromUrl === "es") return fromUrl;
    const stored = window.sessionStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    /* storage blocked: fall back to the route locale */
  }
  return null;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function formatPhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return d;
}

export function WellnessCheck({ copy, initialLang }: Props) {
  const src = useSyncExternalStore(
    subscribeNever,
    () => sanitizeSrc(new URLSearchParams(window.location.search).get("src")),
    () => wellnessConfig.defaultSrc,
  );
  // ?lang= wins, then what was chosen earlier in this session, then the route
  // locale. Read through useSyncExternalStore so the server render and the
  // hydration pass agree (both start from `initialLang`).
  const [chosenLang, setChosenLang] = useState<Language | null>(null);
  const preferredLang = useSyncExternalStore(
    subscribeNever,
    () => readLangPreference(),
    () => null,
  );
  const lang: Language = chosenLang ?? preferredLang ?? initialLang;
  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<Partial<WellnessAnswers>>({ topics: [] });
  const [selecting, setSelecting] = useState(false);
  const [pending, setPending] = useState(false);
  const canShare = useSyncExternalStore(
    subscribeNever,
    () => typeof navigator.share === "function",
    () => false,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<ContactMethod | null>(null);
  const [prefLang, setPrefLang] = useState<Language | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "email" | "method" | "consent", true>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [result, setResult] = useState<{ evaluation: Evaluation; name: string; method: ContactMethod; lang: Language } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const fieldId = useId();

  const t = useMemo(
    () =>
      createTranslator({
        locale: lang,
        messages: copy[lang] as Parameters<typeof createTranslator>[0]["messages"],
      }) as unknown as (key: string, values?: Record<string, string | number>) => string,
    [copy, lang],
  );

  useEffect(() => {
    setTrackContext({ src, agent: "melany" });
    track("lm_view");
    // Also retries any lead left over from an earlier visit (pending note is set from its callback).
    return watchConnectivity(() => setPending(hasPending()));
  }, [src]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Move focus to the new screen's heading so screen readers and keyboard users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [screen]);

  const switchLang = (next: Language) => {
    if (next === lang) return;
    setChosenLang(next);
    try {
      window.sessionStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
    track("lm_lang_toggle", { to: next });
  };

  const go = useCallback((next: Screen) => {
    setSelecting(false);
    setScreen(next);
    if (typeof next === "number") track(`lm_step_${next}`);
    if (next === "form") track("lm_form_view");
  }, []);

  const goBack = () => {
    if (screen === 1) go("welcome");
    else if (typeof screen === "number") go((screen - 1) as Screen);
    else if (screen === "form") go(6);
  };

  const choose = (field: (typeof SINGLE_QUESTIONS)[number]["field"], id: string, n: number) => {
    if (selecting) return;
    setAnswers((a) => ({ ...a, [field]: id }));
    setSelecting(true);
    window.setTimeout(() => go(n === 5 ? 6 : ((n + 1) as Screen)), 200);
  };

  const toggleTopic = (id: TopicId) =>
    setAnswers((a) => {
      const topics = a.topics ?? [];
      return { ...a, topics: topics.includes(id) ? topics.filter((x) => x !== id) : [...topics, id] };
    });

  const clearError = (field: keyof typeof errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = normalizeUsPhone(phone);
    const nextErrors = {
      name: !name.trim() || undefined,
      phone: !phoneDigits || undefined,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || undefined,
      method: !method || undefined,
      consent: !consent || undefined,
    };
    const invalid = (Object.keys(nextErrors) as Array<keyof typeof nextErrors>).filter((k) => nextErrors[k]);
    setErrors(nextErrors as typeof errors);
    if (invalid.length) {
      const first = invalid[0];
      document.getElementById(`${fieldId}-${first}`)?.focus();
      return;
    }
    if (honeypot) {
      // A bot filled the hidden field: pretend it worked, send nothing.
      go("result");
      return;
    }

    const full = answers as WellnessAnswers;
    const evaluation = evaluate(full);
    const language = prefLang ?? lang;
    const contactMethod = method as ContactMethod;
    const body = buildIntakeBody(
      {
        name: name.trim(),
        phoneDigits: phoneDigits as string,
        email: email.trim(),
        contactMethod,
        language,
        answers: full,
        evaluation,
        sourceUrl: window.location.href,
        consentText: t("form.consent"),
        consentAtIso: new Date().toISOString(),
      },
      t,
    );

    track("lm_submit");
    setResult({ evaluation, name: name.trim().split(/\s+/)[0], method: contactMethod, lang: language });
    go("result");
    track("lm_result_view", { strong: evaluation.strongCount });
    // Show the result immediately; delivery happens in the background and is
    // retried if the network drops.
    void sendLead(idempotencyKey(phoneDigits as string, src), body, () => setPending(hasPending())).then(
      (state) => setPending(state === "queued"),
    );
  };

  const stepNumber = typeof screen === "number" ? screen : screen === "form" ? 6 : 0;
  const progress = screen === "form" ? 100 : (stepNumber / 6) * 100;
  const showBack = screen !== "welcome" && screen !== "result";

  return (
    <div className={styles.page}>
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-4">
        <Image src="/images/Logo.PNG" alt="A&J Real Estate Group" width={96} height={58} priority className="h-11 w-auto" />
        <div role="group" aria-label={t("ui.langAria")} className="flex rounded-lg bg-navy-900/5 p-1 text-sm font-semibold">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLang(l)}
              aria-pressed={lang === l}
              className={`min-h-10 min-w-12 rounded-md px-3 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                lang === l ? "bg-navy-900 text-cream" : "text-navy-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {showBack && (
        <div className="mx-auto w-full max-w-lg px-4 pt-3">
          <div className="flex items-center justify-between text-sm text-navy-700">
            <button
              type="button"
              onClick={goBack}
              className="-ml-2 inline-flex min-h-12 items-center gap-1.5 rounded-lg px-2 font-medium focus-visible:outline-2 focus-visible:outline-gold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("ui.back")}
            </button>
            {typeof screen === "number" && (
              <span aria-live="polite">{t("ui.stepOf", { n: screen, total: 6 })}</span>
            )}
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-900/10" aria-hidden="true">
            <div className={`${styles.bar} h-full rounded-full bg-gold`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6 pb-4">
        <div key={String(screen)} className={styles.stepIn}>
          {screen === "welcome" && (
            <section aria-labelledby={`${fieldId}-h`} className="pt-6">
              <Wellmark />
              <h1 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight text-navy-900 outline-none">
                {t("welcome.title")}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-navy-700">{t("welcome.body")}</p>
              <p className="mt-3 text-sm text-navy-500">{t("welcome.micro")}</p>
            </section>
          )}

          {SINGLE_QUESTIONS.map(({ n, field, ids }) =>
            screen === n ? (
              <section key={n} aria-labelledby={`${fieldId}-h`}>
                <h2 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[1.95rem] leading-tight font-semibold text-navy-900 outline-none">
                  {t(`q${n}.title`)}
                </h2>
                {n === 3 && <p className="mt-2 text-sm leading-relaxed text-navy-600">{t("q3.help")}</p>}
                <div role="group" aria-labelledby={`${fieldId}-h`} className="mt-5 grid gap-3">
                  {ids.map((id) => (
                    <OptionButton
                      key={id}
                      selected={answers[field] === id}
                      onClick={() => choose(field, id, n)}
                    >
                      {t(`q${n}.options.${id}`)}
                    </OptionButton>
                  ))}
                </div>
              </section>
            ) : null,
          )}

          {screen === 6 && (
            <section aria-labelledby={`${fieldId}-h`}>
              <h2 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[1.95rem] leading-tight font-semibold text-navy-900 outline-none">
                {t("q6.title")}
              </h2>
              <p className="mt-2 text-sm text-navy-600">
                {t("ui.optional")} · {t("ui.chooseMany")}
              </p>
              <div role="group" aria-labelledby={`${fieldId}-h`} className="mt-5 grid gap-3">
                {topicIds.map((id) => (
                  <OptionButton key={id} selected={(answers.topics ?? []).includes(id)} onClick={() => toggleTopic(id)} multi>
                    {t(`q6.options.${id}`)}
                  </OptionButton>
                ))}
              </div>
            </section>
          )}

          {screen === "form" && (
            <form onSubmit={submit} noValidate aria-labelledby={`${fieldId}-h`}>
              <h2 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[1.95rem] leading-tight font-semibold text-navy-900 outline-none">
                {t("form.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{t("form.body")}</p>

              <div className="mt-5 grid gap-4">
                <Field id={`${fieldId}-name`} label={t("form.name")} error={errors.name && t("form.errors.name")}>
                  <input
                    id={`${fieldId}-name`}
                    name="given-name"
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? `${fieldId}-name-err` : undefined}
                    className={styles.input}
                  />
                </Field>

                <Field id={`${fieldId}-phone`} label={t("form.phone")} help={t("form.phoneHelp")} error={errors.phone && t("form.errors.phone")}>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-900/20 bg-navy-900/5 px-3 text-base text-navy-700" aria-hidden="true">
                      +1
                    </span>
                    <input
                      id={`${fieldId}-phone`}
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatPhoneInput(e.target.value));
                        clearError("phone");
                      }}
                      aria-invalid={errors.phone ? true : undefined}
                      aria-describedby={errors.phone ? `${fieldId}-phone-err` : undefined}
                      className={`${styles.input} ${styles.inputJoined}`}
                    />
                  </div>
                </Field>

                <Field id={`${fieldId}-email`} label={t("form.email")} error={errors.email && t("form.errors.email")}>
                  <input
                    id={`${fieldId}-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? `${fieldId}-email-err` : undefined}
                    className={styles.input}
                  />
                </Field>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-navy-900">{t("form.contactMethod")}</legend>
                  <div id={`${fieldId}-method`} tabIndex={-1} className="grid grid-cols-2 gap-2 outline-none">
                    {METHODS.map((m) => (
                      <OptionButton key={m} compact selected={method === m} onClick={() => {
                          setMethod(m);
                          clearError("method");
                        }}>
                        {t(`form.methods.${m}`)}
                      </OptionButton>
                    ))}
                  </div>
                  {errors.method && <p className="mt-1.5 text-sm text-[#8a3b2c]" role="alert">{t("form.errors.contactMethod")}</p>}
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-navy-900">{t("form.language")}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["en", "es"] as const).map((l) => (
                      <OptionButton key={l} compact selected={(prefLang ?? lang) === l} onClick={() => setPrefLang(l)}>
                        {l === "en" ? "English" : "Español"}
                      </OptionButton>
                    ))}
                  </div>
                </fieldset>

                {/* Honeypot: invisible to people, tempting to bots. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </label>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-navy-900/10">
                    <input
                      id={`${fieldId}-consent`}
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        clearError("consent");
                      }}
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? `${fieldId}-consent-err` : undefined}
                      className="mt-0.5 h-6 w-6 shrink-0 accent-navy-900"
                    />
                    <span className="text-[13px] leading-relaxed text-navy-700">{t("form.consent")}</span>
                  </label>
                  {errors.consent && (
                    <p id={`${fieldId}-consent-err`} className="mt-1.5 text-sm text-[#8a3b2c]" role="alert">
                      {t("form.errors.consent")}
                    </p>
                  )}
                </div>
              </div>

              <StickyBar>
                <button type="submit" className={styles.primary}>
                  {t("form.submit")}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </StickyBar>
            </form>
          )}

          {screen === "result" && result && (
            <ResultView
              t={t}
              lang={lang}
              result={result}
              pending={pending}
              canShare={canShare}
              headingRef={headingRef}
              headingId={`${fieldId}-h`}
            />
          )}
        </div>
      </main>

      {screen === "welcome" && (
        <StickyBar>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              track("lm_start");
              go(1);
            }}
          >
            {t("welcome.cta")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </StickyBar>
      )}

      {screen === 6 && (
        <StickyBar>
          <button type="button" className={styles.primary} onClick={() => go("form")}>
            {t("ui.continue")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </StickyBar>
      )}
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function Wellmark() {
  return (
    <svg viewBox="0 0 64 64" className="mb-5 h-14 w-14 text-gold" fill="none" aria-hidden="true">
      <path d="M8 30 32 10l24 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 28v24h36V28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 46c-7-4.6-10-8-10-11.2 0-2.7 2-4.6 4.5-4.6 2.2 0 4.2 1.4 5.5 3.7 1.3-2.3 3.3-3.7 5.5-3.7 2.5 0 4.5 1.9 4.5 4.6C42 38 39 41.4 32 46Z" fill="currentColor" />
    </svg>
  );
}

function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.sticky}>
      <div className="mx-auto w-full max-w-lg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  multi,
  compact,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  multi?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${styles.option} ${compact ? "min-h-12 justify-center text-center text-[15px]" : "min-h-14 text-left"} ${
        selected ? styles.optionOn : ""
      }`}
    >
      <span className="flex-1">{children}</span>
      {multi && (
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            selected ? "border-gold bg-gold text-navy-950" : "border-navy-900/25"
          }`}
        >
          {selected && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
      )}
    </button>
  );
}

function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {help && !error && <p className="mt-1 text-xs text-navy-500">{help}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-[#8a3b2c]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Result ──────────────────────────────────────────────────────────────────

function ResultView({
  t,
  lang,
  result,
  pending,
  canShare,
  headingRef,
  headingId,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  lang: Language;
  result: { evaluation: Evaluation; name: string; method: ContactMethod; lang: Language };
  pending: boolean;
  canShare: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  headingId: string;
}) {
  const { evaluation, name, method } = result;
  const phone = wellnessConfig.agent.phoneE164;
  const message = t("result.ctaMessage", { name });
  const href = {
    text: `sms:${phone}?&body=${encodeURIComponent(message)}`,
    whatsapp: `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
    call: `tel:${phone}`,
    email: `mailto:${wellnessConfig.agent.email}?subject=${encodeURIComponent(t("result.ctaEmailSubject"))}&body=${encodeURIComponent(message)}`,
  }[method];
  const CtaIcon = { text: MessageSquareText, whatsapp: MessageCircle, call: Phone, email: Mail }[method];

  const updated = new Date(`${affordabilityConfig.lastUpdated}T12:00:00`).toLocaleDateString(
    lang === "es" ? "es-US" : "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  const share = async () => {
    track("lm_share");
    try {
      await navigator.share({
        title: t("result.shareTitle"),
        text: t("result.shareText"),
        url: `${window.location.origin}/${lang}/wellness?src=share-friend`,
      });
    } catch {
      /* dismissed */
    }
  };

  return (
    <div>
      <section aria-labelledby={headingId}>
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="font-display text-[1.85rem] leading-tight font-semibold text-navy-900 outline-none">
          {t("result.greeting", { name })}
        </h2>
        <p className="mt-2 text-lg font-semibold text-navy-700">{t(`result.overall.${evaluation.overall}`)}</p>
      </section>

      <ul className="mt-5 grid grid-cols-2 gap-3">
        {pillarOrder.map((p) => {
          const status = evaluation.pillars[p];
          const Icon = PILLAR_ICON[p];
          return (
            <li key={p} className="flex flex-col rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-navy-900/5">
              <Icon className="h-5 w-5 text-navy-500" aria-hidden="true" />
              <p className="mt-2 font-display text-xl leading-tight font-semibold text-navy-900">{t(`result.pillars.${p}`)}</p>
              <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>
                {status === "strong" && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
                {t(`result.status.${status}`)}
              </span>
              <p className="mt-2 text-[13px] leading-snug text-navy-700">{t(`result.pillarLine.${p}.${status}`)}</p>
            </li>
          );
        })}
      </ul>

      <section className="mt-6" aria-labelledby={`${headingId}-steps`}>
        <h3 id={`${headingId}-steps`} className="font-display text-2xl font-semibold text-navy-900">
          {t("result.stepsTitle")}
        </h3>
        <ol className="mt-3 grid gap-3">
          {evaluation.steps.map((id: StepId, i: number) => (
            <li key={id} className="flex gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-navy-900/5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-cream" aria-hidden="true">
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-navy-800">{t(`result.steps.${id}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5 rounded-2xl bg-navy-900 p-4 text-cream">
        <h3 className="font-display text-xl font-semibold text-gold">{t("result.hidden.title")}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-cream/90">{t("result.hidden.body")}</p>
        <a
          href={`/${lang}/wellness/costs`}
          target="_blank"
          rel="noopener"
          onClick={() => track("lm_costs_view")}
          className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl border border-gold/50 px-4 text-sm font-semibold text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("result.hidden.cta")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>

      {evaluation.estimate && (
        <section className="mt-5 rounded-2xl border border-dashed border-navy-900/20 p-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-navy-500 uppercase">{t("result.estimate.label")}</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-navy-800">
            {t("result.estimate.body", {
              monthly: usd(evaluation.estimate.monthly),
              price: usd(evaluation.estimate.price),
              cash: usd(Math.round(evaluation.estimate.cash)),
            })}
          </p>
        </section>
      )}

      {pending && (
        <p role="status" className="mt-5 rounded-xl bg-[#f6ecd5] px-4 py-3 text-sm leading-relaxed text-[#775816]">
          {t("result.pending")}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        <a
          href={href}
          onClick={() => track("lm_cta_click", { channel: method })}
          target={method === "whatsapp" ? "_blank" : undefined}
          rel={method === "whatsapp" ? "noopener" : undefined}
          className={styles.primary}
        >
          <CtaIcon className="h-5 w-5" aria-hidden="true" />
          {t("result.cta")}
        </a>
        {canShare && (
          <button type="button" onClick={share} className={styles.secondary}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {t("result.share")}
          </button>
        )}
      </div>

      <footer className="mt-8 border-t border-navy-900/10 pt-5 text-xs leading-relaxed text-navy-600">
        <p>{t("result.disclaimer")}</p>
        <p className="mt-2">
          {t("result.rateNote", { rate: (evaluation.rateUsed * 100).toFixed(2), date: updated })}
        </p>
        <p className="mt-4 flex items-center gap-2 font-semibold text-navy-800">
          <EqualHousingMark className="h-7 w-7 shrink-0" />
          <span>
            {t("result.equalHousing")} ·{" "}
            {wellnessConfig.brokerage.legalName ?? wellnessConfig.brokerage.displayName}
          </span>
        </p>
      </footer>
    </div>
  );
}
