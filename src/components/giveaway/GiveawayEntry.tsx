"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createTranslator } from "next-intl";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { Gift, PartyPopper, Sparkles } from "lucide-react";
import { giveawayConfig, sanitizeSrc } from "@/lib/giveaway/config";
import {
  buildIntakeBody,
  hasPending,
  idempotencyKey,
  normalizeUsPhone,
  sendEntry,
  watchConnectivity,
  type Language,
} from "@/lib/giveaway/crm";
import { setTrackContext, track } from "@/lib/giveaway/track";
import { celebrate } from "./celebrate";
import { GiftArt } from "./GiftArt";
import styles from "./Giveaway.module.css";

// Petals and sparkles: a separate chunk, mounted only after the page is idle.
const BloomParticles = dynamic(() => import("./BloomParticles"), { ssr: false });

type Translate = (key: string, values?: Record<string, string | number>) => string;

interface Props {
  /** Both locales travel to the client so the EN/ES toggle never navigates. */
  copy: Record<Language, Record<string, unknown>>;
  initialLang: Language;
}

const LANG_KEY = "ajreg.giveaway.lang";
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

function formatPhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return d;
}

/** Renders `Enter the <em>Good For Her</em> Giveaway…` with the marked words in italic rose. */
function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(/(<em>.*?<\/em>)/g).map((part, i) =>
        part.startsWith("<em>") ? <em key={i}>{part.slice(4, -5)}</em> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

export function GiveawayEntry({ copy, initialLang }: Props) {
  const src = useSyncExternalStore(
    subscribeNever,
    () => sanitizeSrc(new URLSearchParams(window.location.search).get("src")),
    () => giveawayConfig.defaultSrc,
  );
  // ?lang= wins, then what was chosen earlier in this session, then the route
  // locale. Read through useSyncExternalStore so the server render and the
  // hydration pass agree (both start from `initialLang`).
  const [chosenLang, setChosenLang] = useState<Language | null>(null);
  const preferredLang = useSyncExternalStore(subscribeNever, () => readLangPreference(), () => null);
  const lang: Language = chosenLang ?? preferredLang ?? initialLang;
  const reduce = useReducedMotion();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "email" | "consent", true>>>({});
  const [entered, setEntered] = useState<string | null>(null); // first name once entered
  const [pending, setPending] = useState(false);
  const [showPetals, setShowPetals] = useState(false);
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
    // Also retries any entry left over from an earlier visit.
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

  useEffect(() => {
    if (entered) void celebrate();
  }, [entered]);

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

  const clearError = (field: keyof typeof errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = phone.trim() ? normalizeUsPhone(phone) : null;
    const nextErrors = {
      name: !name.trim() || undefined,
      phone: (phone.trim() && !phoneDigits) || undefined,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || undefined,
      consent: !consent || undefined,
    };
    const invalid = (Object.keys(nextErrors) as Array<keyof typeof nextErrors>).filter((k) => nextErrors[k]);
    setErrors(nextErrors as typeof errors);
    if (invalid.length) {
      document.getElementById(`${fieldId}-${invalid[0]}`)?.focus();
      return;
    }
    const firstName = name.trim().split(/\s+/)[0];
    if (honeypot) {
      // A bot filled the hidden field: pretend it worked, send nothing.
      setEntered(firstName);
      return;
    }

    const body = buildIntakeBody({
      name: name.trim(),
      phoneDigits,
      email: email.trim(),
      language: lang,
      sourceUrl: window.location.href,
      consentText: t("form.consent"),
      consentAtIso: new Date().toISOString(),
    });

    track("lm_submit");
    // Confirm immediately; delivery happens in the background and is retried
    // if the network drops.
    setEntered(firstName);
    void sendEntry(idempotencyKey(email, src), body, () => setPending(hasPending())).then((state) =>
      setPending(state === "queued"),
    );
  };

  const fade = reduce
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.34, ease: EASE },
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

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <m.section {...fade} aria-labelledby={`${fieldId}-h`} className="text-center">
            <GiftArt label={t("hero.giftAlt")} />
            <h1
              id={`${fieldId}-h`}
              className={`${styles.title} mt-2 font-display text-[2.35rem] leading-[1.04] font-semibold text-balance`}
            >
              {/* Read raw: ICU would parse the <em> markup as a rich-text tag. */}
              <Emphasis text={(copy[lang].hero as { heading: string }).heading} />
            </h1>
            <p className="mx-auto mt-3 max-w-[22rem] text-base leading-relaxed text-[var(--ink-soft)]">{t("hero.body")}</p>
          </m.section>

          <div className={`${styles.ticketWrap} mt-6`}>
            <div className={styles.ticket}>
              <div className={styles.stub}>
                <Sparkles className="h-4 w-4 text-gold" aria-hidden="true" />
                {t("ticket.label")}
                <Sparkles className="h-4 w-4 text-gold" aria-hidden="true" />
              </div>
              <div className={styles.perforation} aria-hidden="true" />

              {entered ? (
                <m.div {...fade} role="status" className="px-5 pt-7 pb-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--rose-100)] text-[var(--rose)]">
                    <PartyPopper className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 font-display text-[1.9rem] leading-tight font-semibold text-balance">
                    {t("success.title", { name: entered })}
                  </h2>
                  <p className="mt-2 text-base text-[var(--ink-soft)]">{t("success.body")}</p>
                  {pending && (
                    <p className="mt-4 rounded-2xl bg-[#fdeed8] px-4 py-3 text-sm leading-relaxed text-[#7a4d12]">
                      {t("success.pending")}
                    </p>
                  )}
                </m.div>
              ) : (
                <form onSubmit={submit} noValidate className="grid gap-4 px-5 pt-5 pb-6">
                  <Field id={`${fieldId}-name`} label={t("form.name")} error={errors.name && t("form.errors.name")}>
                    <input
                      id={`${fieldId}-name`}
                      name="given-name"
                      autoComplete="name"
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

                  <Field
                    id={`${fieldId}-phone`}
                    label={`${t("form.phone")} · ${t("form.phoneOptional")}`}
                    error={errors.phone && t("form.errors.phone")}
                  >
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

                  <button type="submit" className={`${styles.primary} mt-1`}>
                    <Gift className="h-5 w-5" aria-hidden="true" />
                    {t("form.submit")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </LazyMotion>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-[#a23a26]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
