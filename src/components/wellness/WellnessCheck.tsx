"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createTranslator } from "next-intl";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  CreditCard,
  Flower2,
  Heart,
  MessageCircle,
  MessageSquareText,
  Phone,
  PiggyBank,
  Share2,
  Sparkles,
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
  type Language,
} from "@/lib/wellness/crm";
import { setTrackContext, track } from "@/lib/wellness/track";
import { celebrate } from "./celebrate";
import { EqualHousingMark } from "./EqualHousingMark";
import styles from "./Wellness.module.css";

// Petals and sparkles: a separate chunk, mounted only after the page is idle.
const BloomParticles = dynamic(() => import("./BloomParticles"), { ssr: false });

type Messages = Record<string, unknown>;
type Translate = (key: string, values?: Record<string, string | number>) => string;

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

const BLOOMS: Record<PillarStatus, number> = { strong: 3, almost: 2, start: 1 };
const LANG_KEY = "ajreg.wellness.lang";
const EASE = [0.22, 1, 0.36, 1] as const;

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

/** Renders `Your Home <em>Wellness</em> Check` with the marked word in italic rose. */
function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(/(<em>.*?<\/em>)/g).map((part, i) =>
        part.startsWith("<em>") ? <em key={i}>{part.slice(4, -5)}</em> : <span key={i}>{part}</span>,
      )}
    </>
  );
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
  const preferredLang = useSyncExternalStore(subscribeNever, () => readLangPreference(), () => null);
  const lang: Language = chosenLang ?? preferredLang ?? initialLang;

  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<Partial<WellnessAnswers>>({ topics: [] });
  const [selecting, setSelecting] = useState(false);
  const [pending, setPending] = useState(false);
  const [showPetals, setShowPetals] = useState(false);
  const canShare = useSyncExternalStore(
    subscribeNever,
    () => typeof navigator.share === "function",
    () => false,
  );
  const reduce = useReducedMotion();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "email" | "consent", true>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [result, setResult] = useState<{ evaluation: Evaluation; name: string; lang: Language } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const entered = useRef(false);
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
    setTrackContext({ src, agent: "melany" });
    track("lm_view");
    // Also retries any lead left over from an earlier visit (pending note is set from its callback).
    return watchConnectivity(() => setPending(hasPending()));
  }, [src]);

  // Petals load after the page is idle, and never for reduced-motion / data-saver visitors.
  useEffect(() => {
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const handle = idle(() => setShowPetals(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle as number);
    };
  }, [reduce]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

  // Move focus to the new screen's heading once it has entered, so screen
  // readers and keyboard users follow along (not on the very first paint).
  const focusHeading = () => {
    if (!entered.current) {
      entered.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  };

  const goBack = () => {
    if (screen === 1) go("welcome");
    else if (typeof screen === "number") go((screen - 1) as Screen);
    else if (screen === "form") go(6);
  };

  const choose = (field: (typeof SINGLE_QUESTIONS)[number]["field"], id: string, n: number) => {
    if (selecting) return;
    setAnswers((a) => ({ ...a, [field]: id }));
    setSelecting(true);
    window.setTimeout(() => go(n === 5 ? 6 : ((n + 1) as Screen)), 240);
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
      consent: !consent || undefined,
    };
    const invalid = (Object.keys(nextErrors) as Array<keyof typeof nextErrors>).filter((k) => nextErrors[k]);
    setErrors(nextErrors as typeof errors);
    if (invalid.length) {
      document.getElementById(`${fieldId}-${invalid[0]}`)?.focus();
      return;
    }
    if (honeypot) {
      // A bot filled the hidden field: pretend it worked, send nothing.
      go("result");
      return;
    }

    const full = answers as WellnessAnswers;
    const evaluation = evaluate(full);
    const body = buildIntakeBody(
      {
        name: name.trim(),
        phoneDigits: phoneDigits as string,
        email: email.trim(),
        language: lang,
        answers: full,
        evaluation,
        sourceUrl: window.location.href,
        consentText: t("form.consent"),
        consentAtIso: new Date().toISOString(),
      },
      t,
    );

    track("lm_submit");
    setResult({ evaluation, name: name.trim().split(/\s+/)[0], lang });
    go("result");
    track("lm_result_view", { strong: evaluation.strongCount });
    // Show the result immediately; delivery happens in the background and is
    // retried if the network drops.
    void sendLead(idempotencyKey(phoneDigits as string, src), body, () => setPending(hasPending())).then(
      (state) => setPending(state === "queued"),
    );
  };

  const stepNumber = typeof screen === "number" ? screen : screen === "form" ? 7 : 0;
  const showBack = screen !== "welcome" && screen !== "result";
  const enter = reduce
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.26, ease: EASE },
      };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className={styles.page}>
        {showPetals && (
          <div className={styles.particles} aria-hidden="true">
            <BloomParticles />
          </div>
        )}

        <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-4">
          <Image src="/images/Logo.PNG" alt="A&J Real Estate Group" width={96} height={58} priority className="h-11 w-auto" />
          <div role="group" aria-label={t("ui.langAria")} className={styles.langWrap}>
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                aria-pressed={lang === l}
                className={`${styles.langBtn} ${lang === l ? styles.langOn : ""}`}
              >
                {lang === l && (
                  <m.span
                    layoutId="lang-pill"
                    className={styles.langPill}
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {showBack && (
          <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-2">
            <button type="button" onClick={goBack} className={styles.back}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("ui.back")}
            </button>
            <div className="flex items-center gap-3">
              <div className={styles.dots} aria-hidden="true">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <m.span
                    key={i}
                    className={styles.dot}
                    initial={false}
                    animate={{
                      width: i === stepNumber ? 26 : 8,
                      backgroundColor: i < stepNumber ? "#e9a1b2" : i === stepNumber ? "#a8405c" : "#f4c7d1",
                    }}
                    transition={{ duration: 0.26, ease: EASE }}
                  />
                ))}
              </div>
              {typeof screen === "number" && (
                <span className="text-sm font-medium text-[var(--ink-soft)]" aria-live="polite">
                  {screen}/6
                </span>
              )}
            </div>
          </div>
        )}

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-5 pb-4">
          {/* Enter-only: the DOM swaps instantly, so a throttled frame clock can never leave the old screen on top. */}
          <m.div key={String(screen)} {...enter} onAnimationStart={focusHeading}>
              {screen === "welcome" && (
                <section aria-labelledby={`${fieldId}-h`} className="pt-2">
                  <div className="relative">
                    <div className={styles.archGlow} aria-hidden="true" />
                    <div className={styles.arch}>
                      <Image
                        src="/images/hero-team/Melany_Portrait.webp"
                        alt={t("welcome.photoAlt")}
                        fill
                        priority
                        sizes="272px"
                        className="object-cover object-top"
                      />
                    </div>
                    <Sparkles className="absolute top-2 left-[8%] h-7 w-7 text-gold" aria-hidden="true" />
                    <Heart className="absolute top-[38%] right-[4%] h-6 w-6 fill-[#f0a6b6] text-[#f0a6b6]" aria-hidden="true" />
                    <Flower2 className="absolute bottom-[8%] left-[6%] h-8 w-8 text-[#e9a1b2]" aria-hidden="true" />
                  </div>
                  <h1
                    id={`${fieldId}-h`}
                    ref={headingRef}
                    tabIndex={-1}
                    className={`${styles.title} mt-7 text-center font-display text-[2.55rem] leading-[1.02] font-semibold text-balance outline-none`}
                  >
                    {/* Read raw: ICU would parse the <em> markup as a rich-text tag. */}
                    <Emphasis text={(copy[lang].welcome as { heading: string }).heading} />
                  </h1>
                  <p className="mt-4 text-center text-base leading-relaxed text-[var(--ink-soft)]">{t("welcome.body")}</p>
                  <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label={t("welcome.micro")}>
                    {(copy[lang].welcome as { chips: string[] }).chips.map((chip) => (
                      <li key={chip} className={styles.tag}>
                        <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-center text-sm text-[var(--ink-soft)]">{t("welcome.micro")}</p>
                </section>
              )}

              {SINGLE_QUESTIONS.map(({ n, field, ids }) =>
                screen === n ? (
                  <section key={n} aria-labelledby={`${fieldId}-h`}>
                    <h2 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[2rem] leading-[1.1] font-semibold text-balance outline-none">
                      {t(`q${n}.title`)}
                    </h2>
                    {n === 3 && <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{t("q3.help")}</p>}
                    <div role="group" aria-labelledby={`${fieldId}-h`} className="mt-5 grid gap-3">
                      {ids.map((id, i) => (
                        <OptionButton
                          key={id}
                          index={i}
                          reduce={!!reduce}
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
                  <h2 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[2rem] leading-[1.1] font-semibold text-balance outline-none">
                    {t("q6.title")}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {t("ui.optional")} · {t("ui.chooseMany")}
                  </p>
                  <div role="group" aria-labelledby={`${fieldId}-h`} className="mt-5 grid gap-3">
                    {topicIds.map((id, i) => (
                      <OptionButton
                        key={id}
                        index={i}
                        reduce={!!reduce}
                        selected={(answers.topics ?? []).includes(id)}
                        onClick={() => toggleTopic(id)}
                      >
                        {t(`q6.options.${id}`)}
                      </OptionButton>
                    ))}
                  </div>
                </section>
              )}

              {screen === "form" && (
                <form id={`${fieldId}-form`} onSubmit={submit} noValidate aria-labelledby={`${fieldId}-h`}>
                  <h2 id={`${fieldId}-h`} ref={headingRef} tabIndex={-1} className="font-display text-[2rem] leading-[1.1] font-semibold text-balance outline-none">
                    {t("form.title")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{t("form.body")}</p>

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
                        <span className={styles.prefix} aria-hidden="true">
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

                    {/* Honeypot: invisible to people, tempting to bots. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label>
                        Website
                        <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                      </label>
                    </div>

                    <div>
                      <label className={styles.consent}>
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
                          className="mt-0.5 h-6 w-6 shrink-0"
                        />
                        <span className="text-[13px] leading-relaxed text-[var(--ink-soft)]">{t("form.consent")}</span>
                      </label>
                      {errors.consent && (
                        <p id={`${fieldId}-consent-err`} className="mt-1.5 text-sm text-[#a23a26]" role="alert">
                          {t("form.errors.consent")}
                        </p>
                      )}
                    </div>
                  </div>

                </form>
              )}

              {screen === "result" && result && (
                <ResultView
                  t={t}
                  lang={lang}
                  result={result}
                  pending={pending}
                  canShare={canShare}
                  reduce={!!reduce}
                  headingRef={headingRef}
                  headingId={`${fieldId}-h`}
                />
              )}
          </m.div>
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

        {screen === "form" && (
          <StickyBar>
            <button type="submit" form={`${fieldId}-form`} className={styles.primary}>
              {t("form.submit")}
              <Sparkles className="h-5 w-5" aria-hidden="true" />
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
    </LazyMotion>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

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
  index,
  reduce,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  index: number;
  reduce: boolean;
}) {
  return (
    <m.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${styles.option} min-h-14 text-left ${selected ? styles.optionOn : ""}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE, delay: reduce ? 0 : 0.05 + index * 0.045 }}
      whileTap={reduce ? undefined : { scale: 0.975 }}
    >
      <span className={styles.bullet} aria-hidden="true">
        {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Flower2 className="h-3.5 w-3.5" />}
      </span>
      <span className="flex-1">{children}</span>
    </m.button>
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {help && !error && <p className="mt-1 text-xs text-[var(--ink-soft)]">{help}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-[#a23a26]" role="alert">
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
  reduce,
  headingRef,
  headingId,
}: {
  t: Translate;
  lang: Language;
  result: { evaluation: Evaluation; name: string; lang: Language };
  pending: boolean;
  canShare: boolean;
  reduce: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  headingId: string;
}) {
  const { evaluation, name } = result;
  const phone = wellnessConfig.agent.phoneE164;
  const message = t("result.ctaMessage", { name });
  const whatsappHref = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  const textHref = `sms:${phone}?&body=${encodeURIComponent(message)}`;
  const callHref = `tel:${phone}`;

  useEffect(() => {
    void celebrate();
  }, []);

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

  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.34, ease: EASE, delay: 0.08 + i * 0.07 },
        };

  return (
    <div>
      <section aria-labelledby={headingId} className="text-center">
        <Image
          src="/images/avatars/melany_avatar.webp"
          alt=""
          width={72}
          height={72}
          className="mx-auto h-[4.5rem] w-[4.5rem] rounded-full object-cover shadow-lg ring-4 ring-white/80"
        />
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[2rem] leading-[1.08] font-semibold text-balance outline-none">
          {t("result.greeting", { name })}
        </h2>
        <p className="mt-2 font-display text-xl text-[var(--rose)] italic">{t(`result.overall.${evaluation.overall}`)}</p>
      </section>

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {pillarOrder.map((p, i) => {
          const status = evaluation.pillars[p];
          const Icon = PILLAR_ICON[p];
          return (
            <m.li key={p} className={`${styles.pillar} ${styles[status]}`} {...rise(i)}>
              <Icon className={`${styles.icon} h-5 w-5`} aria-hidden="true" />
              <h3 className="mt-2 font-display text-xl leading-tight font-semibold">{t(`result.pillars.${p}`)}</h3>
              <p className={`${styles.state} mt-1 flex items-center gap-1.5 text-xs font-bold`}>
                <span className="flex gap-0.5" aria-hidden="true">
                  {[0, 1, 2].map((b) => (
                    <Flower2 key={b} className={`h-3.5 w-3.5 ${b < BLOOMS[status] ? "" : "opacity-25"}`} />
                  ))}
                </span>
                {t(`result.status.${status}`)}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-[var(--ink)]">{t(`result.pillarLine.${p}.${status}`)}</p>
            </m.li>
          );
        })}
      </ul>

      <section className="mt-8" aria-labelledby={`${headingId}-steps`}>
        <h3 id={`${headingId}-steps`} className="font-display text-[1.7rem] font-semibold">
          {t("result.stepsTitle")}
        </h3>
        <ol className="mt-3 grid gap-3">
          {evaluation.steps.map((id: StepId, i: number) => (
            <m.li key={id} className={`${styles.card} flex gap-3`} {...rise(4 + i)}>
              <span className={styles.stepNo} aria-hidden="true">
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed">{t(`result.steps.${id}`)}</p>
            </m.li>
          ))}
        </ol>
      </section>

      <section className={`${styles.hidden} mt-6`}>
        <h3 className="font-display text-xl font-semibold text-[#e7c98d]">{t("result.hidden.title")}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#fff6f3]/90">{t("result.hidden.body")}</p>
        <a
          href={`/${lang}/wellness/costs`}
          target="_blank"
          rel="noopener"
          onClick={() => track("lm_costs_view")}
          className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full border border-[#e7c98d]/60 px-4 text-sm font-semibold text-[#e7c98d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e7c98d]"
        >
          {t("result.hidden.cta")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>

      {evaluation.estimate && (
        <section className="mt-6 rounded-3xl border-2 border-dashed border-[#a8405c]/30 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-[var(--rose-deep)] uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("result.estimate.label")}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            {t("result.estimate.body", {
              monthly: usd(evaluation.estimate.monthly),
              price: usd(evaluation.estimate.price),
              cash: usd(Math.round(evaluation.estimate.cash)),
            })}
          </p>
        </section>
      )}

      {pending && (
        <p role="status" className="mt-5 rounded-2xl bg-[#fdeed8] px-4 py-3 text-sm leading-relaxed text-[#7a4d12]">
          {t("result.pending")}
        </p>
      )}

      <div className="mt-7 grid gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener"
          onClick={() => track("lm_cta_click", { channel: "whatsapp" })}
          className={styles.primary}
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {t("result.cta")}
        </a>
        <div>
          <p className="mb-2 text-center text-sm text-[var(--ink-soft)]">{t("result.more")}</p>
          <div className="flex gap-2">
            <a href={textHref} onClick={() => track("lm_cta_click", { channel: "text" })} className={styles.chip}>
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              {t("result.channels.text")}
            </a>
            <a href={callHref} onClick={() => track("lm_cta_click", { channel: "call" })} className={styles.chip}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              {t("result.channels.call")}
            </a>
          </div>
        </div>
        {canShare && (
          <button type="button" onClick={share} className={styles.secondary}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {t("result.share")}
          </button>
        )}
      </div>

      <footer className="mt-9 border-t border-[#a8405c]/15 pt-5 text-xs leading-relaxed text-[var(--ink-soft)]">
        <p>{t("result.disclaimer")}</p>
        <p className="mt-2">{t("result.rateNote", { rate: (evaluation.rateUsed * 100).toFixed(2), date: updated })}</p>
        <p className="mt-4 flex items-center gap-2 font-semibold text-[var(--ink)]">
          <EqualHousingMark className="h-7 w-7 shrink-0" />
          <span>
            {t("result.equalHousing")} · {wellnessConfig.brokerage.legalName ?? wellnessConfig.brokerage.displayName}
          </span>
        </p>
      </footer>
    </div>
  );
}
