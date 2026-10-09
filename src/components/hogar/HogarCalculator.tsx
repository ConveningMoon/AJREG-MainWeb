"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { createTranslator } from "next-intl";
import { ArrowLeft, ArrowRight, BedDouble, Check, MessageCircle, Minus, Plus, Share2, Wallet } from "lucide-react";
import { affordabilityConfig } from "@/lib/affordability";
import { hogarConfig, sanitizeSrc } from "@/lib/hogar/config";
import { buildIntakeBody } from "@/lib/hogar/crm";
import {
  LIMITS,
  bandOrder,
  evaluate,
  timelineIds,
  validate,
  type BandId,
  type Evaluation,
  type HogarAnswers,
  type TimelineId,
} from "@/lib/hogar/engine";
import {
  formatPhoneInput,
  hasPending,
  idempotencyKey,
  normalizeUsPhone,
  sendLead,
  watchConnectivity,
  type Language,
} from "@/lib/hogar/intake";
import { setTrackContext, track } from "@/lib/track";
import { EqualHousingMark } from "@/components/ui/EqualHousingMark";
import { Field, OptionButton, StickyBar } from "./HogarParts";
import styles from "./Hogar.module.css";

type Messages = Record<string, unknown>;
type Translate = (key: string, values?: Record<string, string | number>) => string;

interface Props {
  /** Only the `hogar` slice of each locale, so the toggle switches language without navigating. */
  copy: Record<Language, Messages>;
  initialLang: Language;
}

type Screen = "welcome" | 1 | 2 | 3 | 4 | "form" | "result";
type MoneyField = "income" | "debts" | "savings";

const TOTAL_STEPS = 4;
const LANG_KEY = "ajreg.hogar.lang";
const DEFAULT_HOUSEHOLD = 3;

/** One-tap shortcuts per question. The last chip of each row means "this much or more". */
const CHIPS: Record<MoneyField, readonly number[]> = {
  income: [3000, 4500, 6000, 8000, 10000],
  debts: [0, 200, 500, 1000, 1500],
  savings: [0, 3000, 8000, 15000, 25000],
};
const MONEY_STEPS = [
  { n: 2, field: "income" },
  { n: 3, field: "debts" },
  { n: 4, field: "savings" },
] as const;

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
const shortPrice = (n: number) => `$${Math.round(n / 1000)}k`;
const digitsOnly = (raw: string) => raw.replace(/\D/g, "").slice(0, 7);
const showMoney = (digits: string) => (digits ? Number(digits).toLocaleString("en-US") : "");

export function HogarCalculator({ copy, initialLang }: Props) {
  const src = useSyncExternalStore(
    subscribeNever,
    () => sanitizeSrc(new URLSearchParams(window.location.search).get("src")),
    () => hogarConfig.defaultSrc,
  );
  const [chosenLang, setChosenLang] = useState<Language | null>(null);
  const preferredLang = useSyncExternalStore(subscribeNever, () => readLangPreference(), () => null);
  const lang: Language = chosenLang ?? preferredLang ?? initialLang;

  const [screen, setScreen] = useState<Screen>("welcome");
  const [household, setHousehold] = useState<number>(DEFAULT_HOUSEHOLD);
  const [money, setMoney] = useState<Record<MoneyField, string>>({ income: "", debts: "", savings: "" });
  const [moneyError, setMoneyError] = useState<MoneyField | null>(null);
  const [pending, setPending] = useState(false);
  const canShare = useSyncExternalStore(subscribeNever, () => typeof navigator.share === "function", () => false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [prefLang, setPrefLang] = useState<Language | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "email" | "timeline" | "consent", true>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [result, setResult] = useState<{ evaluation: Evaluation; answers: HogarAnswers; name: string } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const fieldId = useId();

  const t = useMemo(
    () =>
      createTranslator({
        locale: lang,
        messages: copy[lang] as Parameters<typeof createTranslator>[0]["messages"],
      }) as unknown as Translate,
    [copy, lang],
  );

  useEffect(() => {
    setTrackContext({ src, agent: "adriana" });
    track("lm_view");
    // Also retries any lead left over from an earlier visit.
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
    setScreen(next);
    if (typeof next === "number") track(`lm_step_${next}`);
    if (next === "form") track("lm_form_view");
  }, []);

  const goBack = () => {
    if (screen === 1) go("welcome");
    else if (typeof screen === "number") go((screen - 1) as Screen);
    else if (screen === "form") go(TOTAL_STEPS);
  };

  const amount = (field: MoneyField) => (money[field] === "" ? NaN : Number(money[field]));

  /** Validates the current money question; on success moves on. */
  const continueFromMoney = (field: MoneyField, n: number) => {
    const errs = validate({ household, income: amount("income"), debts: amount("debts"), savings: amount("savings") });
    // Only the question on screen is judged now; later ones are still empty.
    if (errs[field]) {
      setMoneyError(field);
      document.getElementById(`${fieldId}-${field}`)?.focus();
      return;
    }
    setMoneyError(null);
    go(n === TOTAL_STEPS ? "form" : ((n + 1) as Screen));
  };

  const clearError = (field: keyof typeof errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = normalizeUsPhone(phone);
    const nextErrors = {
      name: !name.trim() || undefined,
      phone: !phoneDigits || undefined,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || undefined,
      timeline: !timeline || undefined,
      consent: !consent || undefined,
    };
    const invalid = (Object.keys(nextErrors) as Array<keyof typeof nextErrors>).filter((k) => nextErrors[k]);
    setErrors(nextErrors as typeof errors);
    if (invalid.length) {
      document.getElementById(`${fieldId}-${invalid[0]}`)?.focus();
      return;
    }

    const answers: HogarAnswers = {
      household,
      income: amount("income"),
      debts: amount("debts"),
      savings: amount("savings"),
    };
    const evaluation = evaluate(answers);
    const firstName = name.trim().split(/\s+/)[0];

    track("lm_submit");
    setResult({ evaluation, answers, name: firstName });
    go("result");
    track("lm_result_view", { comfortable: evaluation.bands.comodo.price, tight: evaluation.tight });
    if (honeypot) return; // a bot filled the hidden field: pretend it worked, send nothing

    const body = buildIntakeBody(
      {
        name: name.trim(),
        phoneDigits: phoneDigits as string,
        email: email.trim(),
        timeline: timeline as TimelineId,
        language: prefLang ?? lang,
        answers,
        evaluation,
        src,
        sourceUrl: window.location.href,
        consentText: t("form.consent"),
        consentAtIso: new Date().toISOString(),
      },
      t,
    );
    // The result is already on screen; delivery happens in the background and
    // is retried if the network drops.
    void sendLead(idempotencyKey(phoneDigits as string, src), body, () => setPending(hasPending())).then(
      (state) => setPending(state === "queued"),
    );
  };

  const stepNumber = typeof screen === "number" ? screen : screen === "form" ? TOTAL_STEPS : 0;
  const progress = screen === "form" ? 100 : (stepNumber / TOTAL_STEPS) * 100;
  const showBack = screen !== "welcome" && screen !== "result";
  const headingProps = { id: `${fieldId}-h`, ref: headingRef, tabIndex: -1 } as const;
  const h2 = "font-display text-[1.95rem] leading-tight font-semibold text-navy-900 outline-none";

  return (
    <div className={styles.page}>
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-4">
        <Image src="/images/Logo.PNG" alt="A&J Real Estate Group" width={96} height={58} priority className="h-11 w-auto" />
        <div role="group" aria-label={t("ui.langAria")} className="flex rounded-lg bg-navy-900/5 p-1 text-sm font-semibold">
          {(["es", "en"] as const).map((l) => (
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
            {typeof screen === "number" && <span aria-live="polite">{t("ui.stepOf", { n: screen, total: TOTAL_STEPS })}</span>}
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-900/10" aria-hidden="true">
            <div className={`${styles.bar} h-full rounded-full bg-gold`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6 pb-4">
        <div key={String(screen)} className={styles.stepIn}>
          {screen === "welcome" && (
            <section aria-labelledby={`${fieldId}-h`} className="pt-4">
              <div className="mb-6 flex items-center gap-3">
                <Image
                  src="/images/avatars/adriana_avatar.webp"
                  alt=""
                  width={56}
                  height={56}
                  priority
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-gold"
                />
                <p className="text-sm font-semibold text-navy-700">{t("welcome.agent")}</p>
              </div>
              <h1 {...headingProps} className="font-display text-[2.6rem] leading-[1.02] font-semibold tracking-tight text-navy-900 outline-none">
                {t("welcome.title")}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-navy-700">{t("welcome.body")}</p>
              <p className="mt-3 text-sm text-navy-500">{t("welcome.micro")}</p>
            </section>
          )}

          {screen === 1 && (
            <section aria-labelledby={`${fieldId}-h`}>
              <h2 {...headingProps} className={h2}>
                {t("q1.title")}
              </h2>
              <div className="mt-10 flex items-center justify-center gap-6" role="group" aria-labelledby={`${fieldId}-h`}>
                <StepperButton
                  label={t("q1.decrease")}
                  disabled={household <= LIMITS.household.min}
                  onClick={() => setHousehold((h) => Math.max(LIMITS.household.min, h - 1))}
                >
                  <Minus className="h-7 w-7" aria-hidden="true" />
                </StepperButton>
                <div className="min-w-[8.5rem] text-center" aria-live="polite">
                  <p className="font-display text-7xl leading-none font-semibold text-navy-900">{household}</p>
                  <p className="mt-2 text-base font-medium text-navy-600">{t("q1.value", { count: household })}</p>
                </div>
                <StepperButton
                  label={t("q1.increase")}
                  disabled={household >= LIMITS.household.max}
                  onClick={() => setHousehold((h) => Math.min(LIMITS.household.max, h + 1))}
                >
                  <Plus className="h-7 w-7" aria-hidden="true" />
                </StepperButton>
              </div>
            </section>
          )}

          {MONEY_STEPS.map(({ n, field }) =>
            screen === n ? (
              <form
                key={n}
                aria-labelledby={`${fieldId}-h`}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  continueFromMoney(field, n);
                }}
              >
                <h2 {...headingProps} className={h2}>
                  {t(`q${n}.title`)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{t(`q${n}.help`)}</p>

                <div className="mt-5">
                  <label htmlFor={`${fieldId}-${field}`} className="sr-only">
                    {t(`q${n}.input`)}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-xl border border-r-0 border-navy-900/20 bg-navy-900/5 px-4 text-xl font-semibold text-navy-700" aria-hidden="true">
                      $
                    </span>
                    <input
                      id={`${fieldId}-${field}`}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={showMoney(money[field])}
                      onChange={(e) => {
                        setMoney((m) => ({ ...m, [field]: digitsOnly(e.target.value) }));
                        setMoneyError(null);
                      }}
                      aria-invalid={moneyError === field ? true : undefined}
                      aria-describedby={moneyError === field ? `${fieldId}-${field}-err` : undefined}
                      placeholder="0"
                      className={`${styles.input} ${styles.inputJoined} !min-h-14 !text-xl font-semibold`}
                    />
                  </div>
                  {moneyError === field && (
                    <p id={`${fieldId}-${field}-err`} className="mt-1.5 text-sm text-[#8a3b2c]" role="alert">
                      {t(`q${n}.error`)}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t(`q${n}.input`)}>
                  {CHIPS[field].map((value, i, all) => {
                    const selected = money[field] === String(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setMoney((m) => ({ ...m, [field]: String(value) }));
                          setMoneyError(null);
                        }}
                        className={`${styles.option} !w-auto min-h-12 justify-center px-4 text-[15px] ${selected ? styles.optionOn : ""}`}
                      >
                        {usd(value)}
                        {i === all.length - 1 ? "+" : ""}
                      </button>
                    );
                  })}
                </div>
                {/* Lets the phone keyboard's "Go" key advance; the visible button is the sticky one. */}
                <button type="submit" className="sr-only" tabIndex={-1}>
                  {t("ui.continue")}
                </button>
              </form>
            ) : null,
          )}

          {screen === "form" && (
            <form onSubmit={submit} noValidate aria-labelledby={`${fieldId}-h`}>
              <h2 {...headingProps} className={h2}>
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
                  <legend className="mb-2 text-sm font-semibold text-navy-900">{t("form.timeline.label")}</legend>
                  <div id={`${fieldId}-timeline`} tabIndex={-1} className="grid grid-cols-2 gap-2 outline-none">
                    {timelineIds.map((id) => (
                      <OptionButton
                        key={id}
                        compact
                        selected={timeline === id}
                        onClick={() => {
                          setTimeline(id);
                          clearError("timeline");
                        }}
                      >
                        {t(`form.timeline.options.${id}`)}
                      </OptionButton>
                    ))}
                  </div>
                  {errors.timeline && (
                    <p className="mt-1.5 text-sm text-[#8a3b2c]" role="alert">
                      {t("form.errors.timeline")}
                    </p>
                  )}
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-navy-900">{t("form.language")}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["es", "en"] as const).map((l) => (
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

      {screen === 1 && (
        <StickyBar>
          <button type="button" className={styles.primary} onClick={() => go(2)}>
            {t("ui.continue")}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </StickyBar>
      )}

      {MONEY_STEPS.map(({ n, field }) =>
        screen === n ? (
          <StickyBar key={n}>
            <button type="button" className={styles.primary} onClick={() => continueFromMoney(field, n)}>
              {t("ui.continue")}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </StickyBar>
        ) : null,
      )}
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-900 text-cream transition-[transform,opacity] duration-150 active:scale-95 disabled:opacity-30 motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {children}
    </button>
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
  t: Translate;
  lang: Language;
  result: { evaluation: Evaluation; answers: HogarAnswers; name: string };
  pending: boolean;
  canShare: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  headingId: string;
}) {
  const { evaluation: e, answers, name } = result;
  const [saveHint, setSaveHint] = useState(false);
  const comfortable = e.bands.comodo.price;
  const phone = hogarConfig.agent.phoneE164;
  const message = e.tight
    ? t("result.ctaMessageTight", { name })
    : t("result.ctaMessage", { name, price: usd(comfortable) });
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  const updated = new Date(`${affordabilityConfig.lastUpdated}T12:00:00`).toLocaleDateString(
    lang === "es" ? "es-US" : "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );
  const maxPrice = e.bands.maximo.price || 1;
  const beds = e.bedrooms.min === e.bedrooms.max ? String(e.bedrooms.min) : `${e.bedrooms.min}–${e.bedrooms.max}`;
  const pct = (n: number) => String(Math.round(n * 10) / 10);

  const save = async () => {
    track("lm_save");
    if (!canShare) {
      setSaveHint(true);
      return;
    }
    try {
      await navigator.share({
        title: t("result.shareTitle"),
        text: e.tight ? t("result.shareTextTight") : t("result.shareText", { price: usd(comfortable) }),
      });
    } catch {
      /* dismissed */
    }
  };

  return (
    <div>
      <section aria-labelledby={headingId}>
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-base font-semibold text-navy-600 outline-none">
          {t("result.greeting", { name })}
        </h2>

        {e.tight ? (
          <div className="mt-3 rounded-3xl bg-navy-900 p-6 text-cream">
            <Wallet className="h-7 w-7 text-gold" aria-hidden="true" />
            <p className="mt-3 font-display text-3xl leading-tight font-semibold text-gold">{t("result.tightTitle")}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-cream/90">
              {e.debtsLimit ? t("result.tightDebts") : t("result.tightGeneral")}
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-3xl bg-navy-900 p-6 text-cream">
            <p className="text-[17px] leading-snug font-medium text-cream/90">{t("result.heroLead")}</p>
            <p className="mt-1 font-display text-[4rem] leading-none font-semibold tracking-tight text-gold">~{usd(comfortable)}</p>
            {t("result.heroTail") && <p className="mt-1 text-[17px] font-medium text-cream/90">{t("result.heroTail")}</p>}
          </div>
        )}
      </section>

      {!e.tight && (
        <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5" aria-labelledby={`${headingId}-range`}>
          <h3 id={`${headingId}-range`} className="font-display text-2xl font-semibold text-navy-900">
            {t("result.bandsTitle")}
          </h3>
          {/* Range bar drawn with CSS: each marker sits at its band's share of the maximum. */}
          <div className="relative mx-2.5 mt-5 h-2.5 rounded-full bg-gradient-to-r from-blush via-gold/70 to-gold" aria-hidden="true">
            {bandOrder.map((id) => (
              <span
                key={id}
                className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                  id === "comodo" ? "bg-navy-900" : "bg-navy-500"
                }`}
                style={{ left: `${Math.min(100, (e.bands[id].price / maxPrice) * 100)}%` }}
              />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-2 text-center">
            {bandOrder.map((id: BandId) => (
              <li key={id} className={`rounded-xl px-1.5 py-2.5 ${id === "comodo" ? "bg-navy-900 text-cream" : "bg-navy-900/5 text-navy-900"}`}>
                <p className={`text-[11px] font-semibold tracking-wide uppercase ${id === "comodo" ? "text-gold" : "text-navy-600"}`}>
                  {t(`result.bands.${id}`)}
                </p>
                <p className="mt-0.5 font-display text-2xl leading-none font-semibold">{shortPrice(e.bands[id].price)}</p>
                <p className={`mt-1 text-[11px] leading-tight ${id === "comodo" ? "text-cream/80" : "text-navy-600"}`}>
                  {t("result.bandMonthly", { monthly: usd(e.bands[id].monthly) })}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-navy-600">{t("result.bandsNote")}</p>
        </section>
      )}

      {!e.tight && (
        <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5" aria-labelledby={`${headingId}-cash`}>
          <h3 id={`${headingId}-cash`} className="font-display text-2xl font-semibold text-navy-900">
            {t("result.cashTitle")}
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-navy-800">
            {t("result.cashBody", {
              down: pct(affordabilityConfig.fhaDownPct * 100),
              closing: pct(affordabilityConfig.closingPct * 100),
              cash: usd(e.cashNeeded),
            })}
          </p>
          <p
            className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm leading-relaxed font-medium ${
              e.coversCash ? "bg-[#e3efe6] text-[#25563a]" : "bg-[#f6ecd5] text-[#775816]"
            }`}
          >
            {e.coversCash && <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />}
            <span>{e.coversCash ? t("result.cashCovered") : t("result.cashGap", { gap: usd(e.cashGap) })}</span>
          </p>
        </section>
      )}

      <section className="mt-4 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/5">
        <BedDouble className="mt-0.5 h-6 w-6 shrink-0 text-navy-500" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold text-navy-900">{t("result.spaceTitle")}</h3>
          <p className="mt-0.5 text-[15px] leading-relaxed text-navy-800">
            {t("result.spaceBody", { count: answers.household, beds })}
          </p>
        </div>
      </section>

      <section className="mt-6" aria-labelledby={`${headingId}-steps`}>
        <h3 id={`${headingId}-steps`} className="font-display text-2xl font-semibold text-navy-900">
          {t("result.stepsTitle")}
        </h3>
        <ol className="mt-3 grid gap-3">
          {e.steps.map((id, i) => (
            <li key={id} className="flex gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-navy-900/5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-cream" aria-hidden="true">
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-navy-800">{t(`result.steps.${id}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {pending && (
        <p role="status" className="mt-5 rounded-xl bg-[#f6ecd5] px-4 py-3 text-sm leading-relaxed text-[#775816]">
          {t("result.pending")}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        <a
          href={href}
          onClick={() => track("lm_whatsapp_click")}
          target="_blank"
          rel="noopener"
          className={styles.primary}
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {t("result.cta")}
        </a>
        <button type="button" onClick={save} className={styles.secondary}>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {t("result.save")}
        </button>
        {saveHint && (
          <p role="status" className="text-center text-sm text-navy-700">
            {t("result.saveHint")}
          </p>
        )}
      </div>

      <footer className="mt-8 border-t border-navy-900/10 pt-5 text-xs leading-relaxed text-navy-600">
        <p>{t("result.disclaimer")}</p>
        <p className="mt-2">{t("result.rateNote", { rate: (e.rateUsed * 100).toFixed(2), date: updated })}</p>
        <p className="mt-4 flex items-center gap-2 font-semibold text-navy-800">
          <EqualHousingMark className="h-7 w-7 shrink-0" />
          <span>
            {t("result.equalHousing")} · {hogarConfig.brokerage.legalName ?? hogarConfig.brokerage.displayName}
          </span>
        </p>
      </footer>
    </div>
  );
}
