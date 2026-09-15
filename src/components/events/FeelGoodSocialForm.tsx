"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Gift, Loader2 } from "lucide-react";
import { buildRaffleCrmAnswers } from "@/lib/feel-good-social-crm";
import {
  feelGoodSocialSchema,
  raffleIntents,
  type FeelGoodSocialValues,
} from "@/lib/feel-good-social-schema";

const CHANNEL_ID =
  process.env.NEXT_PUBLIC_ITMANO_FEEL_GOOD_SOCIAL_CHANNEL_ID ??
  "chn_xk4qyhwgff6e";

type Status = "idle" | "success" | "duplicate" | "error";

const defaultValues: FeelGoodSocialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  intent: undefined as unknown as FeelGoodSocialValues["intent"],
  timeline: "",
  area: "",
  financing: "",
  budget: "",
  agentStatus: "",
  sellMotivation: "",
  listingStatus: "",
  website: "",
};

export function FeelGoodSocialForm() {
  const t = useTranslations("feelGoodSocial");
  const fieldId = useId();
  const formTopRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasMounted = useRef(false);
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FeelGoodSocialValues>({
    resolver: zodResolver(feelGoodSocialSchema),
    defaultValues,
  });

  const intent = useWatch({ control, name: "intent" });
  const isBuyerPath = intent === "buy" || intent === "invest";
  const isSellerPath = intent === "sell";

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const focusTimer = window.setTimeout(
      () => stepHeadingRef.current?.focus({ preventScroll: true }),
      reduceMotion ? 0 : 380,
    );
    return () => window.clearTimeout(focusTimer);
  }, [reduceMotion, step]);

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const continueToPlans = async () => {
    const valid = await trigger(["firstName", "email", "phone"], {
      shouldFocus: true,
    });
    if (!valid) return;
    setDirection(1);
    setStep(2);
    scrollToForm();
  };

  const goBack = () => {
    setDirection(-1);
    setStep(1);
    scrollToForm();
  };

  const onSubmit = async (values: FeelGoodSocialValues) => {
    setStatus("idle");

    if (values.website) {
      setStatus("success");
      reset(defaultValues);
      return;
    }

    try {
      const response = await fetch(`/api/intake/${CHANNEL_ID}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: values.firstName,
          last_name: values.lastName || undefined,
          email: values.email,
          phone: values.phone || undefined,
          language: "en",
          intent: values.intent === "raffle_only" ? undefined : values.intent,
          source_url: window.location.href,
          website: "",
          form_answers: buildRaffleCrmAnswers(values, t),
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; status?: "created" | "already_submitted" }
        | null;

      if (!response.ok || !body?.ok) {
        setStatus("error");
        return;
      }

      setStatus(body.status === "already_submitted" ? "duplicate" : "success");
      reset(defaultValues);
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "mt-1.5 min-h-12 w-full rounded-xl border border-[#d9a8ba] bg-white px-3.5 py-2.5 text-base text-[#2d1830] caret-[#a4134c] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#8a6b7b] focus:border-[#a4134c] focus:ring-2 focus:ring-[#a4134c]/20";
  const labelClass = "block text-sm font-semibold text-[#38152c]";
  const errorClass = "mt-1.5 text-sm font-medium text-[#9c123f]";
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.36, ease: [0.16, 1, 0.3, 1] as const };
  const slideVariants = {
    enter: (dir: 1 | -1) => ({ x: reduceMotion ? 0 : dir * 14, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: reduceMotion ? 0 : dir * -10, opacity: 0 }),
  };

  const errorText = (key?: string, id?: string) =>
    key ? (
      <p id={id} role="alert" className={errorClass}>
        {t(key)}
      </p>
    ) : null;

  if (status === "success" || status === "duplicate") {
    return (
      <motion.div
        role="status"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transition}
        className="py-5 text-center sm:py-8"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#a4134c] text-white">
          {status === "success" ? (
            <Check className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Gift className="h-6 w-6" aria-hidden="true" />
          )}
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-[#38152c]">
          {t(`result.${status}Title`)}
        </h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-[#715265]">
          {t(`result.${status}Body`)}
        </p>
      </motion.div>
    );
  }

  return (
    <div ref={formTopRef} className="scroll-mt-24">
      <div className="mb-5 flex gap-2" aria-hidden="true">
        <span className="h-1.5 flex-1 rounded-full bg-[#a4134c]" />
        <motion.span
          className="h-1.5 flex-1 rounded-full"
          animate={{ backgroundColor: step === 2 ? "#a4134c" : "#ead0d9" }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {step === 1 ? t("form.stepOneAnnouncement") : t("form.stepTwoAnnouncement")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {step === 1 ? (
            <motion.div
              key="contact"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-semibold text-[#38152c] outline-none sm:text-3xl"
              >
                {t("form.contactTitle")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#806776]">
                {t("form.contactIntro")}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${fieldId}-first-name`} className={labelClass}>
                    {t("form.firstName")} <span className="text-[#a4134c]">*</span>
                  </label>
                  <input
                    id={`${fieldId}-first-name`}
                    type="text"
                    required
                    aria-required="true"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? `${fieldId}-first-name-error` : undefined}
                    className={inputClass}
                    {...register("firstName")}
                  />
                  {errorText(errors.firstName?.message, `${fieldId}-first-name-error`)}
                </div>

                <div>
                  <label htmlFor={`${fieldId}-last-name`} className={labelClass}>
                    {t("form.lastName")} <span className="font-normal text-[#806776]">({t("form.optional")})</span>
                  </label>
                  <input
                    id={`${fieldId}-last-name`}
                    type="text"
                    autoComplete="family-name"
                    className={inputClass}
                    {...register("lastName")}
                  />
                </div>

                <div>
                  <label htmlFor={`${fieldId}-email`} className={labelClass}>
                    {t("form.email")} <span className="text-[#a4134c]">*</span>
                  </label>
                  <input
                    id={`${fieldId}-email`}
                    type="email"
                    required
                    aria-required="true"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? `${fieldId}-email-error` : undefined}
                    className={inputClass}
                    {...register("email")}
                  />
                  {errorText(errors.email?.message, `${fieldId}-email-error`)}
                </div>

                <div>
                  <label htmlFor={`${fieldId}-phone`} className={labelClass}>
                    {t("form.phone")} <span className="font-normal text-[#806776]">({t("form.optional")})</span>
                  </label>
                  <input
                    id={`${fieldId}-phone`}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? `${fieldId}-phone-error` : undefined}
                    className={inputClass}
                    {...register("phone")}
                  />
                  {errorText(errors.phone?.message, `${fieldId}-phone-error`)}
                </div>
              </div>

              <button
                type="button"
                onClick={continueToPlans}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#a4134c] px-5 py-3 font-semibold text-white transition-[background-color,box-shadow] duration-200 hover:bg-[#88103f] hover:shadow-[0_12px_24px_-16px_rgba(98,8,48,0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4134c]"
              >
                {t("form.continue")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="plans"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-semibold text-[#38152c] outline-none sm:text-3xl"
              >
                {t("form.plansTitle")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#806776]">
                {t("form.plansIntro")}
              </p>

              {status === "error" && (
                <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl bg-[#fae2e9] p-3.5 text-sm text-[#74102f]">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{t("result.errorTitle")}</p>
                    <p className="mt-0.5 text-[#8b3652]">{t("result.errorBody")}</p>
                  </div>
                </div>
              )}

              <fieldset
                className="mt-5"
                aria-required="true"
                aria-invalid={!!errors.intent}
                aria-describedby={errors.intent ? `${fieldId}-intent-error` : undefined}
              >
                <legend className={labelClass}>
                  {t("form.intent")} <span className="text-[#a4134c]">*</span>
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {raffleIntents.map((value) => (
                    <label
                      key={value}
                      className={`flex min-h-12 cursor-pointer items-center rounded-xl border px-3 py-2.5 text-sm font-semibold transition-[border-color,background-color,color] duration-200 ${
                        intent === value
                          ? "border-[#a4134c] bg-[#f9dce6] text-[#761037]"
                          : "border-[#dfc2cc] bg-white text-[#664054] hover:border-[#c95d82]"
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        className="mr-2.5 h-4 w-4 accent-[#a4134c]"
                        {...register("intent")}
                      />
                      {t(`form.intents.${value}`)}
                    </label>
                  ))}
                </div>
                {errorText(errors.intent?.message, `${fieldId}-intent-error`)}
              </fieldset>

              <AnimatePresence initial={false}>
                {intent && intent !== "raffle_only" && (
                  <motion.div
                    key={intent}
                    initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={transition}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`${fieldId}-timeline`} className={labelClass}>{t("form.timeline")}</label>
                        <select id={`${fieldId}-timeline`} className={inputClass} {...register("timeline")}>
                          <option value="">{t("form.skip")}</option>
                          <option value="under_3_months">{t("form.timelines.under_3_months")}</option>
                          <option value="3_6_months">{t("form.timelines.3_6_months")}</option>
                          <option value="6_12_months">{t("form.timelines.6_12_months")}</option>
                          <option value="over_12_explorando">{t("form.timelines.over_12_explorando")}</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor={`${fieldId}-area`} className={labelClass}>{t("form.area")}</label>
                        <select id={`${fieldId}-area`} className={inputClass} {...register("area")}>
                          <option value="">{t("form.skip")}</option>
                          <option value="virginia_beach">{t("form.areas.virginia_beach")}</option>
                          <option value="north_carolina">{t("form.areas.north_carolina")}</option>
                          <option value="other">{t("form.areas.other")}</option>
                        </select>
                      </div>

                      {isBuyerPath && (
                        <>
                          <div>
                            <label htmlFor={`${fieldId}-financing`} className={labelClass}>{t("form.financing")}</label>
                            <select id={`${fieldId}-financing`} className={inputClass} {...register("financing")}>
                              <option value="">{t("form.skip")}</option>
                              <option value="cash">{t("form.financingOptions.cash")}</option>
                              <option value="preapproved">{t("form.financingOptions.preapproved")}</option>
                              <option value="in_process">{t("form.financingOptions.in_process")}</option>
                              <option value="not_started">{t("form.financingOptions.not_started")}</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`${fieldId}-budget`} className={labelClass}>{t("form.budget")}</label>
                            <select id={`${fieldId}-budget`} className={inputClass} {...register("budget")}>
                              <option value="">{t("form.skip")}</option>
                              <option value="250000">{t("form.budgets.250000")}</option>
                              <option value="250000-599999">{t("form.budgets.250000-599999")}</option>
                              <option value="600000">{t("form.budgets.600000")}</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`${fieldId}-agent-status`} className={labelClass}>{t("form.agentStatus")}</label>
                            <select id={`${fieldId}-agent-status`} className={inputClass} {...register("agentStatus")}>
                              <option value="">{t("form.skip")}</option>
                              <option value="sin_agente">{t("form.agentStatuses.sin_agente")}</option>
                              <option value="con_agente">{t("form.agentStatuses.con_agente")}</option>
                            </select>
                          </div>
                        </>
                      )}

                      {isSellerPath && (
                        <>
                          <div>
                            <label htmlFor={`${fieldId}-sell-motivation`} className={labelClass}>{t("form.sellMotivation")}</label>
                            <select id={`${fieldId}-sell-motivation`} className={inputClass} {...register("sellMotivation")}>
                              <option value="">{t("form.skip")}</option>
                              <option value="alta">{t("form.sellMotivations.alta")}</option>
                              <option value="media">{t("form.sellMotivations.media")}</option>
                              <option value="baja">{t("form.sellMotivations.baja")}</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`${fieldId}-listing-status`} className={labelClass}>{t("form.listingStatus")}</label>
                            <select id={`${fieldId}-listing-status`} className={inputClass} {...register("listingStatus")}>
                              <option value="">{t("form.skip")}</option>
                              <option value="no_listado_sin_agente">{t("form.listingStatuses.no_listado_sin_agente")}</option>
                              <option value="ya_listado_con_agente">{t("form.listingStatuses.ya_listado_con_agente")}</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" {...register("website")} />

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-[#d9a8ba] bg-white px-4 py-3 text-sm font-semibold text-[#71485f] transition-colors hover:border-[#a4134c] hover:text-[#761037] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4134c]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {t("form.back")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#a4134c] px-4 py-3 text-sm font-semibold text-white transition-[background-color,box-shadow] duration-200 hover:bg-[#88103f] hover:shadow-[0_12px_24px_-16px_rgba(98,8,48,0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4134c] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {isSubmitting ? t("form.submitting") : t("form.submit")}
                </button>
              </div>
              <p className="mt-3 text-center text-xs leading-relaxed text-[#806776]">{t("form.contactNote")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
