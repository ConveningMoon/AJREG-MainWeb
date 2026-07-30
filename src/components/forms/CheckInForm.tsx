"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Home,
  Info,
  Loader2,
  Tag,
} from "lucide-react";
import { checkInQuestions, type CheckInIntent } from "@/data/checkIn";
import { checkInContactSchema, type CheckInContactValues } from "@/lib/checkin-schema";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

const TOTAL_STEPS = 7; // 1 intent + 5 questions (fixed length on both branches) + 1 contact
const AUTO_ADVANCE_MS = 320;

const optionClass = (selected: boolean) =>
  `flex cursor-pointer items-center gap-3 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-colors sm:text-base ${
    selected
      ? "border-gold bg-gold/10 text-navy"
      : "border-navy-200 bg-white text-navy-600 hover:border-gold/60 hover:bg-blush/20"
  }`;

const slideVariants = {
  enter: (dir: 1 | -1) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

export function CheckInForm() {
  const t = useTranslations("checkIn");
  const locale = useLocale();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [intent, setIntent] = useState<CheckInIntent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // Defensive: never sit on a question step without a chosen branch.
  useEffect(() => {
    if (stepIndex > 0 && stepIndex < 6 && !intent) setStepIndex(0);
  }, [stepIndex, intent]);

  const {
    register,
    handleSubmit,
    reset: resetContactForm,
    formState: { errors },
  } = useForm<CheckInContactValues>({
    resolver: zodResolver(checkInContactSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", message: "" },
  });

  const goBack = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const selectIntent = (value: CheckInIntent) => {
    setIntent(value);
    setAnswers({});
    setDirection(1);
    advanceTimer.current = setTimeout(() => setStepIndex(1), AUTO_ADVANCE_MS);
  };

  const selectAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setDirection(1);
    advanceTimer.current = setTimeout(() => setStepIndex((i) => i + 1), AUTO_ADVANCE_MS);
  };

  const startOver = () => {
    setStatus("idle");
    setIntent(null);
    setAnswers({});
    setDirection(-1);
    setStepIndex(0);
    resetContactForm();
  };

  const onSubmit = async (data: CheckInContactValues) => {
    if (!intent) return;
    setStatus("loading");
    try {
      const questions = checkInQuestions[intent];
      const form_answers = questions.map((q) => {
        const value = answers[q.key] ?? "";
        return {
          key: q.key,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          question: t(`questions.${intent}.${q.key}.question` as any),
          value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: value ? t(`questions.${intent}.${q.key}.options.${value}` as any) : "",
        };
      });

      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          answers: form_answers,
          locale,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: `+1 ${data.phone.trim()}`,
          message: data.message,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; duplicate?: boolean }
        | null;

      if (res.ok && json?.ok) {
        setStatus(json.duplicate ? "duplicate" : "success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  /* ── Result screens ──────────────────────────────────────────────────── */
  if (status === "success" || status === "duplicate") {
    return (
      <div role="status" className="py-4 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" aria-hidden="true" />
        <h2 className="mt-5 font-display text-2xl font-semibold text-navy sm:text-3xl">
          {status === "success" ? t("result.successTitle") : t("result.duplicateTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          {status === "success" ? t("result.successBody") : t("result.duplicateBody")}
        </p>
        <button
          type="button"
          onClick={startOver}
          className="mt-7 inline-flex items-center justify-center rounded-full border border-navy-300 px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold"
        >
          {t("result.startOver")}
        </button>
      </div>
    );
  }

  const pct = ((stepIndex + 1) / TOTAL_STEPS) * 100;
  const inputClass =
    "w-full rounded-lg border border-navy-200 bg-cream/40 px-4 py-2.5 text-navy placeholder:text-navy-400 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelClass = "block text-sm font-medium text-navy-800";
  const errorClass = "mt-1.5 text-sm text-red-600";

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400" aria-live="polite">
          {t("progressLabel", { current: stepIndex + 1, total: TOTAL_STEPS })}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
          <motion.div
            className="h-full rounded-full bg-gold"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {/* Step 0 — intent */}
        {stepIndex === 0 && (
          <motion.div
            key="intent"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: "easeInOut" }}
          >
            <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              {t("intent.question")}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectIntent("buy")}
                className={`flex flex-col items-start gap-3 rounded-2xl border px-6 py-6 text-left transition-colors ${
                  intent === "buy"
                    ? "border-gold bg-gold/10"
                    : "border-navy-200 bg-white hover:border-gold/60 hover:bg-blush/20"
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Home className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-semibold text-navy">
                  {t("intent.buy")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => selectIntent("sell")}
                className={`flex flex-col items-start gap-3 rounded-2xl border px-6 py-6 text-left transition-colors ${
                  intent === "sell"
                    ? "border-gold bg-gold/10"
                    : "border-navy-200 bg-white hover:border-gold/60 hover:bg-blush/20"
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Tag className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-semibold text-navy">
                  {t("intent.sell")}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Steps 1–5 — branch questions */}
        {stepIndex > 0 && stepIndex < 6 && intent && (
          <motion.div
            key={`q-${stepIndex}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: "easeInOut" }}
          >
            {(() => {
              const q = checkInQuestions[intent][stepIndex - 1];
              return (
                <div role="radiogroup" aria-label={t(`questions.${intent}.${q.key}.question` as never)}>
                  <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {t(`questions.${intent}.${q.key}.question` as any)}
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={answers[q.key] === opt}
                        onClick={() => selectAnswer(q.key, opt)}
                        className={optionClass(answers[q.key] === opt)}
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`questions.${intent}.${q.key}.options.${opt}` as any)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Step 6 — contact info */}
        {stepIndex === 6 && (
          <motion.div
            key="contact"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: "easeInOut" }}
          >
            <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              {t("fields.title")}
            </h2>

            {status === "error" && (
              <div className="mt-5 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{t("result.errorTitle")}</p>
                  <p className="mt-1 text-red-700">{t("result.errorBody")}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    {t("fields.firstName")} <span className="text-gold">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`mt-1.5 ${inputClass}`}
                    aria-invalid={!!errors.firstName}
                    {...register("firstName")}
                  />
                  {errors.firstName && <p className={errorClass}>{t(errors.firstName.message as never)}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    {t("fields.lastName")} <span className="text-gold">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`mt-1.5 ${inputClass}`}
                    aria-invalid={!!errors.lastName}
                    {...register("lastName")}
                  />
                  {errors.lastName && <p className={errorClass}>{t(errors.lastName.message as never)}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  {t("fields.email")} <span className="text-gold">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`mt-1.5 ${inputClass}`}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && <p className={errorClass}>{t(errors.email.message as never)}</p>}
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  {t("fields.phone")} <span className="text-gold">*</span>
                </label>
                <div className="mt-1.5 flex items-stretch overflow-hidden rounded-lg border border-navy-200 bg-cream/40 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
                  <span className="flex select-none items-center border-r border-navy-200 bg-navy-50 px-3 text-sm font-semibold text-navy-500">
                    {t("fields.phonePrefix")}
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder="(555) 000-0000"
                    className="w-full bg-transparent px-4 py-2.5 text-navy placeholder:text-navy-400 outline-none"
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                </div>
                {errors.phone && <p className={errorClass}>{t(errors.phone.message as never)}</p>}
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  {t("fields.message")}{" "}
                  <span className="text-navy-400">({t("fields.optional")})</span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  maxLength={2000}
                  className={`mt-1.5 ${inputClass} resize-y`}
                  {...register("message")}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition-colors hover:border-navy-400"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {t("back")}
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {status === "loading" ? t("submitting") : t("submit")}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button for question steps (intent tiles auto-advance; contact step has its own back button above) */}
      {stepIndex > 0 && stepIndex < 6 && (
        <button
          type="button"
          onClick={goBack}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("back")}
        </button>
      )}

      {stepIndex === 0 && (
        <p className="mt-6 flex items-start gap-2 text-xs text-navy-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("intent.hint")}
        </p>
      )}
    </div>
  );
}
