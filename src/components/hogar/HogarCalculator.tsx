"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createTranslator } from "next-intl";
import { AnimatePresence, animate, m, LazyMotion, domAnimation, useReducedMotion } from "motion/react";
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
import { Awning, Bunting, Casita, Person } from "./HogarArt";
import { celebrate } from "./celebrate";
import { signFont } from "./fonts";
import { Field, OptionButton, StickyBar } from "./HogarParts";
import styles from "./Hogar.module.css";

// Confetti drifting behind the flow: its own chunk, mounted after first paint.
const PapelParticles = dynamic(() => import("./PapelParticles"), { ssr: false });

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

/** True when decorative motion (confetti, particles) should stay off. */
function prefersCalm(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData === true;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const shortPrice = (n: number) => `$${Math.round(n / 1000)}k`;
const digitsOnly = (raw: string) => raw.replace(/\D/g, "").slice(0, 7);
const showMoney = (digits: string) => (digits ? Number(digits).toLocaleString("en-US") : "");

const H2 = `${styles.display} text-[1.95rem] text-navy-900 outline-none`;

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
  const [showParticles, setShowParticles] = useState(false);
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

  // Particles wait for the browser to be idle and never load for people who
  // asked for less motion or a data saver.
  useEffect(() => {
    if (prefersCalm()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => setShowParticles(true)) : window.setTimeout(() => setShowParticles(true), 600);
    return () => {
      if (!w.requestIdleCallback) window.clearTimeout(id);
    };
  }, []);

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
    const phoneTyped = phone.trim() !== "";
    const phoneDigits = phoneTyped ? normalizeUsPhone(phone) : null;
    const nextErrors = {
      name: !name.trim() || undefined,
      // The phone is optional, but if it is typed it has to be a real US number.
      phone: (phoneTyped && !phoneDigits) || undefined,
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
        phoneDigits,
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
    void sendLead(idempotencyKey(email, src), body, () => setPending(hasPending())).then(
      (state) => setPending(state === "queued"),
    );
  };

  // Flags painted so far on the bunting: the form is the fifth.
  const flagsDone = typeof screen === "number" ? screen : screen === "form" ? TOTAL_STEPS + 1 : 0;
  const showBack = screen !== "welcome" && screen !== "result";
  const headingProps = { id: `${fieldId}-h`, ref: headingRef, tabIndex: -1 } as const;

  return (
    <LazyMotion features={domAnimation} strict>
      <div className={`${styles.page} ${signFont.variable}`}>
        {showParticles && <PapelParticles />}
        <Awning />

        <header className="relative z-10 mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-3">
          <Image src="/images/Logo.PNG" alt="A&J Real Estate Group" width={96} height={58} priority className="h-11 w-auto" />
          <div role="group" aria-label={t("ui.langAria")} className="flex rounded-xl border-[2.5px] border-navy-900 bg-cream p-0.5 text-sm font-bold">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                aria-pressed={lang === l}
                className={`min-h-10 min-w-12 rounded-[9px] px-3 uppercase transition-colors ${
                  lang === l ? "bg-navy-900 text-[#f7b500]" : "text-navy-900"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </header>

        {showBack && (
          <div className="relative z-10 mx-auto w-full max-w-lg px-4 pt-2">
            <div className="flex items-center justify-between text-sm font-bold text-navy-900">
              <button type="button" onClick={goBack} className="-ml-2 inline-flex min-h-12 items-center gap-1.5 rounded-lg px-2">
                <ArrowLeft className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                {t("ui.back")}
              </button>
              {typeof screen === "number" && <span aria-live="polite">{t("ui.stepOf", { n: screen, total: TOTAL_STEPS })}</span>}
            </div>
            <Bunting done={flagsDone} label={typeof screen === "number" ? t("ui.stepOf", { n: screen, total: TOTAL_STEPS }) : t("form.title")} />
          </div>
        )}

        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-5 pb-4">
          <div key={String(screen)} className={styles.stepIn}>
            {screen === "welcome" && (
              <section aria-labelledby={`${fieldId}-h`} className="pt-1">
                <Casita className="mx-auto h-auto w-full max-w-[19rem]" />
                <h1 {...headingProps} className={`${styles.display} mt-4 text-[2.4rem] text-navy-900 outline-none`}>
                  {t("welcome.headLead")} <span className="text-[#c8185f]">{t("welcome.headEm")}</span>
                </h1>
                <p className="mt-3 text-base leading-relaxed font-medium text-navy-900">{t("welcome.body")}</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="rounded-full border-2 border-dashed border-[#c8185f] p-1">
                    <Image
                      src="/images/avatars/adriana_avatar.webp"
                      alt=""
                      width={56}
                      height={56}
                      priority
                      className="h-14 w-14 rounded-full border-2 border-navy-900 object-cover"
                    />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy-900">{t("welcome.agent")}</p>
                    <p className="text-sm font-medium text-navy-800">{t("welcome.micro")}</p>
                  </div>
                </div>
              </section>
            )}

            {screen === 1 && (
              <section aria-labelledby={`${fieldId}-h`}>
                <h2 {...headingProps} className={H2}>
                  {t("q1.title")}
                </h2>
                <div className={`${styles.board} mt-5 px-4 py-6`} role="group" aria-labelledby={`${fieldId}-h`}>
                  <div className="flex items-center justify-center gap-5">
                    <StepperButton
                      label={t("q1.decrease")}
                      disabled={household <= LIMITS.household.min}
                      onClick={() => setHousehold((h) => Math.max(LIMITS.household.min, h - 1))}
                    >
                      <Minus className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
                    </StepperButton>
                    <div className="min-w-[7.5rem] text-center" aria-live="polite">
                      <p className={`${styles.display} ${styles.paintDark} text-[5rem] leading-none text-[#c8185f]`}>{household}</p>
                      <p className="mt-2 text-base font-bold text-navy-900">{t("q1.value", { count: household })}</p>
                    </div>
                    <StepperButton
                      label={t("q1.increase")}
                      disabled={household >= LIMITS.household.max}
                      onClick={() => setHousehold((h) => Math.min(LIMITS.household.max, h + 1))}
                    >
                      <Plus className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
                    </StepperButton>
                  </div>
                  <div className="mt-5 flex min-h-[2.4rem] flex-wrap items-end justify-center gap-1" aria-hidden="true">
                    <AnimatePresence initial={false}>
                      {Array.from({ length: household }, (_, i) => (
                        <m.span
                          key={i}
                          initial={{ scale: 0, y: 8 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, y: 8 }}
                          transition={{ type: "spring", stiffness: 420, damping: 22 }}
                          className="inline-flex origin-bottom"
                        >
                          <Person index={i} />
                        </m.span>
                      ))}
                    </AnimatePresence>
                  </div>
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
                  <h2 {...headingProps} className={H2}>
                    {t(`q${n}.title`)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed font-semibold text-navy-900">{t(`q${n}.help`)}</p>

                  <div className={`${styles.board} mt-4 p-4`}>
                    <label htmlFor={`${fieldId}-${field}`} className="sr-only">
                      {t(`q${n}.input`)}
                    </label>
                    <div className="flex">
                      <span
                        className={`${styles.display} inline-flex items-center rounded-l-[14px] border-[2.5px] border-r-0 border-navy-900 bg-[#f7b500] px-4 text-2xl text-navy-900`}
                        aria-hidden="true"
                      >
                        $
                      </span>
                      <input
                        id={`${fieldId}-${field}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        value={showMoney(money[field])}
                        onChange={(e) => {
                          setMoney((mo) => ({ ...mo, [field]: digitsOnly(e.target.value) }));
                          setMoneyError(null);
                        }}
                        aria-invalid={moneyError === field ? true : undefined}
                        aria-describedby={moneyError === field ? `${fieldId}-${field}-err` : undefined}
                        placeholder="0"
                        className={`${styles.input} ${styles.inputJoined} !min-h-14 !text-2xl font-extrabold`}
                      />
                    </div>
                    {moneyError === field && (
                      <p id={`${fieldId}-${field}-err`} className="mt-2 text-sm font-bold text-[#a50f4c]" role="alert">
                        {t(`q${n}.error`)}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t(`q${n}.input`)}>
                      {CHIPS[field].map((value, i, all) => {
                        const selected = money[field] === String(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              setMoney((mo) => ({ ...mo, [field]: String(value) }));
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
                <h2 {...headingProps} className={H2}>
                  {t("form.title")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed font-semibold text-navy-900">{t("form.body")}</p>

                <div className={`${styles.board} mt-4 grid gap-4 p-4`}>
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
                    <legend className="mb-2 text-sm font-bold text-navy-900">{t("form.timeline.label")}</legend>
                    <div id={`${fieldId}-timeline`} tabIndex={-1} className="grid grid-cols-2 gap-2 outline-none">
                      {timelineIds.map((id) => (
                        <OptionButton
                          key={id}
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
                      <p className="mt-1.5 text-sm font-bold text-[#a50f4c]" role="alert">
                        {t("form.errors.timeline")}
                      </p>
                    )}
                  </fieldset>

                  <Field id={`${fieldId}-phone`} label={t("form.phone")} help={t("form.phoneHelp")} error={errors.phone && t("form.errors.phone")}>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-[14px] border-[2.5px] border-r-0 border-navy-900 bg-[#f7b500] px-3 text-base font-bold text-navy-900" aria-hidden="true">
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

                  <fieldset>
                    <legend className="mb-2 text-sm font-bold text-navy-900">{t("form.language")}</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(["es", "en"] as const).map((l) => (
                        <OptionButton key={l} selected={(prefLang ?? lang) === l} onClick={() => setPrefLang(l)}>
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
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-navy-900/25 bg-white p-3">
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
                        className="mt-0.5 h-6 w-6 shrink-0 accent-[#c8185f]"
                      />
                      <span className="text-[13px] leading-relaxed font-medium text-navy-900">{t("form.consent")}</span>
                    </label>
                    {errors.consent && (
                      <p id={`${fieldId}-consent-err`} className="mt-1.5 text-sm font-bold text-[#a50f4c]" role="alert">
                        {t("form.errors.consent")}
                      </p>
                    )}
                  </div>
                </div>

                <StickyBar>
                  <button type="submit" className={styles.primary}>
                    {t("form.submit")}
                    <ArrowRight className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
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
              <ArrowRight className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            </button>
          </StickyBar>
        )}

        {screen === 1 && (
          <StickyBar>
            <button type="button" className={styles.primary} onClick={() => go(2)}>
              {t("ui.continue")}
              <ArrowRight className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            </button>
          </StickyBar>
        )}

        {MONEY_STEPS.map(({ n, field }) =>
          screen === n ? (
            <StickyBar key={n}>
              <button type="button" className={styles.primary} onClick={() => continueFromMoney(field, n)}>
                {t("ui.continue")}
                <ArrowRight className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              </button>
            </StickyBar>
          ) : null,
        )}
      </div>
    </LazyMotion>
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
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[2.5px] border-navy-900 bg-[#0a7a76] text-cream shadow-[0_10px_14px_-8px_rgb(16_32_55/0.6)] transition-[transform,opacity] duration-150 active:scale-90 disabled:opacity-35 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      {children}
    </button>
  );
}

/** The price, painted on the sign: counts up once (instantly for reduced motion). */
function PaintedPrice({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v >= value ? value : Math.round(v / 1000) * 1000),
    });
    return () => controls.stop();
  }, [value, reduce]);
  return (
    <>
      <span className="sr-only">~{usd(value)}</span>
      <span aria-hidden="true">~{usd(reduce ? value : shown)}</span>
    </>
  );
}

const TAG_STYLE: Record<BandId, string> = {
  tranquilo: "bg-[#0a7a76] text-cream",
  comodo: "z-10 scale-[1.07] bg-[#c8185f] text-cream",
  maximo: "bg-navy-900 text-[#ffd45a]",
};

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

  // One burst when the sign is hung (not for the "tight" message: nothing to cheer yet).
  useEffect(() => {
    if (!e.tight) void celebrate();
  }, [e.tight]);

  const updated = new Date(`${affordabilityConfig.lastUpdated}T12:00:00`).toLocaleDateString(
    lang === "es" ? "es-US" : "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );
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
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-base font-bold text-navy-900 outline-none">
        {t("result.greeting", { name })}
      </h2>

      <section className={`${styles.board} ${styles.hangSign} mt-9 px-5 py-6 text-center`}>
        {e.tight ? (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-navy-900 bg-[#0a7a76] text-cream">
              <Wallet className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className={`${styles.display} mt-3 text-[1.7rem] text-navy-900`}>{t("result.tightTitle")}</p>
            <p className="mt-3 text-[15px] leading-relaxed font-medium text-navy-900">
              {e.debtsLimit ? t("result.tightDebts") : t("result.tightGeneral")}
            </p>
          </>
        ) : (
          <>
            <p className="text-[17px] leading-snug font-extrabold text-navy-900">{t("result.heroLead")}</p>
            <p className={`${styles.display} ${styles.paintDark} mt-2 text-[clamp(2.05rem,10.2vw,3.1rem)] leading-none tabular-nums text-[#c8185f]`}>
              <PaintedPrice value={comfortable} />
            </p>
            {t("result.heroTail") && <p className="mt-3 text-[17px] font-extrabold text-[#0a7a76]">{t("result.heroTail")}</p>}
          </>
        )}
      </section>

      {!e.tight && (
        <section className="mt-8" aria-labelledby={`${headingId}-range`}>
          <h3 id={`${headingId}-range`} className={`${styles.display} text-2xl text-navy-900`}>
            {t("result.bandsTitle")}
          </h3>
          <div className="relative mt-5 pt-3.5">
            <div className="absolute top-0 right-3 left-3 h-[2.5px] rounded-full bg-navy-900" aria-hidden="true" />
            <ul className="grid grid-cols-3 gap-2.5">
              {bandOrder.map((id: BandId) => (
                <li key={id} className={`${styles.tag} ${TAG_STYLE[id]}`}>
                  <p className="text-[11px] font-extrabold tracking-wide uppercase">{t(`result.bands.${id}`)}</p>
                  <p className={`${styles.display} mt-0.5 text-[1.65rem] leading-none`}>{shortPrice(e.bands[id].price)}</p>
                  <p className="mt-1 px-0.5 text-[11px] leading-tight font-semibold opacity-95">
                    {t("result.bandMonthly", { monthly: usd(e.bands[id].monthly) })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-xs font-semibold text-navy-900">{t("result.bandsNote")}</p>
        </section>
      )}

      {!e.tight && (
        <section className={`${styles.board} mt-6 p-4`} aria-labelledby={`${headingId}-cash`}>
          <h3 id={`${headingId}-cash`} className={`${styles.display} text-2xl text-navy-900`}>
            {t("result.cashTitle")}
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed font-medium text-navy-900">
            {t("result.cashBody", {
              down: pct(affordabilityConfig.fhaDownPct * 100),
              closing: pct(affordabilityConfig.closingPct * 100),
              cash: usd(e.cashNeeded),
            })}
          </p>
          <p
            className={`mt-3 flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-sm leading-relaxed font-bold ${
              e.coversCash ? "border-[#0a7a76] bg-[#dff1ee] text-[#075d59]" : "border-[#c8185f] bg-[#fde3ec] text-[#8d0f43]"
            }`}
          >
            {e.coversCash && <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3.5} aria-hidden="true" />}
            <span>{e.coversCash ? t("result.cashCovered") : t("result.cashGap", { gap: usd(e.cashGap) })}</span>
          </p>
        </section>
      )}

      <section className={`${styles.board} mt-4 flex items-start gap-3 p-4`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[2.5px] border-navy-900 bg-[#ffd45a]">
          <BedDouble className="h-5 w-5 text-navy-900" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-extrabold text-navy-900">{t("result.spaceTitle")}</h3>
          <p className="mt-0.5 text-[15px] leading-relaxed font-medium text-navy-900">
            {t("result.spaceBody", { count: answers.household, beds })}
          </p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby={`${headingId}-steps`}>
        <h3 id={`${headingId}-steps`} className={`${styles.display} text-2xl text-navy-900`}>
          {t("result.stepsTitle")}
        </h3>
        <ol className="mt-3 grid gap-3">
          {e.steps.map((id, i) => (
            <li key={id} className={`${styles.board} flex items-center gap-3 px-4 py-3.5`}>
              <span
                className={`${styles.display} flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-navy-900 bg-[#c8185f] text-lg text-cream`}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed font-semibold text-navy-900">{t(`result.steps.${id}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {pending && (
        <p role="status" className="mt-5 rounded-xl border-2 border-navy-900 bg-cream px-4 py-3 text-sm leading-relaxed font-semibold text-navy-900">
          {t("result.pending")}
        </p>
      )}

      <div className="mt-8 grid gap-3">
        <a href={href} onClick={() => track("lm_whatsapp_click")} target="_blank" rel="noopener" className={styles.primary}>
          <MessageCircle className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          {t("result.cta")}
        </a>
        <button type="button" onClick={save} className={styles.secondary}>
          <Share2 className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          {t("result.save")}
        </button>
        {saveHint && (
          <p role="status" className="text-center text-sm font-bold text-navy-900">
            {t("result.saveHint")}
          </p>
        )}
      </div>

      <footer className="mt-9 border-t-2 border-navy-900/30 pt-5 text-xs leading-relaxed font-medium text-navy-900">
        <p>{t("result.disclaimer")}</p>
        <p className="mt-2">{t("result.rateNote", { rate: (e.rateUsed * 100).toFixed(2), date: updated })}</p>
        <p className="mt-4 flex items-center gap-2 font-bold">
          <EqualHousingMark className="h-7 w-7 shrink-0" />
          <span>
            {t("result.equalHousing")} · {hogarConfig.brokerage.legalName ?? hogarConfig.brokerage.displayName}
          </span>
        </p>
      </footer>
    </div>
  );
}
