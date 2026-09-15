"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, Heart, Loader2 } from "lucide-react";
import {
  feelGoodSocialInterests,
  feelGoodSocialSchema,
  type FeelGoodSocialValues,
} from "@/lib/feel-good-social-schema";

const CHANNEL_ID =
  process.env.NEXT_PUBLIC_ITMANO_FEEL_GOOD_SOCIAL_CHANNEL_ID ??
  "chn_xk4qyhwgff6e";

type Status = "idle" | "success" | "duplicate" | "error";

export function FeelGoodSocialForm() {
  const t = useTranslations("feelGoodSocial");
  const fieldId = useId();
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeelGoodSocialValues>({
    resolver: zodResolver(feelGoodSocialSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      interest: "",
      website: "",
    },
  });

  const onSubmit = async (values: FeelGoodSocialValues) => {
    setStatus("idle");

    // A bot that completes the off-screen honeypot gets a quiet success without
    // ever reaching the CRM. Human submissions always send website as empty.
    if (values.website) {
      setStatus("success");
      reset();
      return;
    }

    const interest = values.interest || undefined;
    const formAnswers = interest
      ? [
          {
            key: "event_interest",
            question: t("form.interest"),
            value: interest,
            label: t(`form.interests.${interest}`),
          },
        ]
      : [];

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
          source_url: window.location.href,
          website: "",
          form_answers: formAnswers,
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
      reset();
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#dba8ba] bg-white px-4 py-3 text-[#2d1830] caret-[#a4134c] outline-none transition-[border-color,box-shadow] placeholder:text-[#806776] focus:border-[#a4134c] focus:ring-2 focus:ring-[#a4134c]/20";

  const errorText = (key?: string, id?: string) =>
    key ? (
      <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-[#9c123f]">
        {t(key)}
      </p>
    ) : null;

  if (status === "success" || status === "duplicate") {
    return (
      <div role="status" className="py-8 text-center sm:py-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a4134c] text-white">
          {status === "success" ? (
            <Check className="h-7 w-7" aria-hidden="true" />
          ) : (
            <Heart className="h-7 w-7" fill="currentColor" aria-hidden="true" />
          )}
        </span>
        <h3 className="mt-6 font-display text-3xl font-semibold tracking-[-0.02em] text-[#38152c]">
          {t(`result.${status}Title`)}
        </h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#715265]">
          {t(`result.${status}Body`)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl bg-[#fae2e9] p-4 text-sm text-[#74102f]"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t("result.errorTitle")}</p>
            <p className="mt-1 text-[#8b3652]">{t("result.errorBody")}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${fieldId}-first-name`}
            className="text-sm font-semibold text-[#38152c]"
          >
            {t("form.firstName")} <span className="text-[#a4134c]">*</span>
          </label>
          <input
            id={`${fieldId}-first-name`}
            type="text"
            required
            aria-required="true"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            aria-describedby={
              errors.firstName ? `${fieldId}-first-name-error` : undefined
            }
            className={inputClass}
            {...register("firstName")}
          />
          {errorText(errors.firstName?.message, `${fieldId}-first-name-error`)}
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-last-name`}
            className="text-sm font-semibold text-[#38152c]"
          >
            {t("form.lastName")} {" "}
            <span className="font-normal text-[#806776]">({t("form.optional")})</span>
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
          <label
            htmlFor={`${fieldId}-email`}
            className="text-sm font-semibold text-[#38152c]"
          >
            {t("form.email")} <span className="text-[#a4134c]">*</span>
          </label>
          <input
            id={`${fieldId}-email`}
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${fieldId}-email-error` : undefined}
            className={inputClass}
            {...register("email")}
          />
          {errorText(errors.email?.message, `${fieldId}-email-error`)}
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-phone`}
            className="text-sm font-semibold text-[#38152c]"
          >
            {t("form.phone")} {" "}
            <span className="font-normal text-[#806776]">({t("form.optional")})</span>
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

      <div>
        <label
          htmlFor={`${fieldId}-interest`}
          className="text-sm font-semibold text-[#38152c]"
        >
          {t("form.interest")} {" "}
          <span className="font-normal text-[#806776]">({t("form.optional")})</span>
        </label>
        <select
          id={`${fieldId}-interest`}
          className={inputClass}
          {...register("interest")}
        >
          <option value="">{t("form.interestPlaceholder")}</option>
          {feelGoodSocialInterests.map((interest) => (
            <option key={interest} value={interest}>
              {t(`form.interests.${interest}`)}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#a4134c] px-6 py-3.5 font-semibold text-white transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#88103f] hover:shadow-[0_12px_28px_-14px_rgba(98,8,48,0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4134c] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        {isSubmitting ? t("form.submitting") : t("form.submit")}
      </button>

      <p className="text-center text-xs leading-relaxed text-[#806776]">
        {t("form.contactNote")}
      </p>
    </form>
  );
}
