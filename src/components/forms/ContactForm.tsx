"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import {
  contactSchema,
  contactIntents,
  contactLanguages,
  type ContactFormValues,
  type ContactIntent,
  type ContactLanguage,
} from "@/lib/contact-schema";

type Status = "idle" | "success" | "duplicate" | "error";

const intentLabelKey: Record<ContactIntent, string> = {
  compra: "form.intentBuy",
  vende: "form.intentSell",
  invierte: "form.intentInvest",
};
const langLabelKey: Record<ContactLanguage, string> = {
  es: "form.langEs",
  en: "form.langEn",
  pt: "form.langPt",
};

const inputClass =
  "w-full rounded-lg border border-navy-200 bg-cream/40 px-4 py-2.5 text-navy placeholder:text-navy-400 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30";
const labelClass = "block text-sm font-medium text-navy-800";

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  const defaultLanguage: ContactLanguage = locale === "es" ? "es" : "en";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      language: defaultLanguage,
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("idle");
    // Submit through the site's own API route — the CRM webhook is
    // server-to-server (shared secret), never called from the browser.
    // No automatic retries: on failure the user retries manually.
    try {
      const res = await fetch("/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; duplicate?: boolean }
        | null;

      if (res.ok && data?.ok) {
        if (data.duplicate) {
          setStatus("duplicate");
        } else {
          setStatus("success");
          reset();
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // Field error: message is an i18n key relative to the `contact` namespace.
  const errorText = (key?: string) =>
    key ? (
      <p className="mt-1.5 text-sm text-red-600" role="alert">
        {t(key)}
      </p>
    ) : null;

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-navy-900/5"
      >
        <CheckCircle2
          className="mx-auto h-12 w-12 text-gold"
          aria-hidden="true"
        />
        <h2 className="mt-4 font-display text-2xl font-semibold text-navy">
          {t("result.successTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          {t("result.successBody")}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-navy-300 px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold"
        >
          {t("result.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5 sm:p-8"
    >
      {status === "duplicate" && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-blush/50 p-4 text-sm text-navy-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t("result.duplicateTitle")}</p>
            <p className="mt-1 text-navy-600">{t("result.duplicateBody")}</p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">{t("result.errorTitle")}</p>
            <p className="mt-1 text-red-700">{t("result.errorBody")}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            {t("form.firstName")} <span className="text-gold">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className={`mt-1.5 ${inputClass}`}
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
          {errorText(errors.firstName?.message)}
        </div>

        <div>
          <label htmlFor="lastName" className={labelClass}>
            {t("form.lastName")} <span className="text-gold">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            className={`mt-1.5 ${inputClass}`}
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
          {errorText(errors.lastName?.message)}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            {t("form.email")} <span className="text-gold">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`mt-1.5 ${inputClass}`}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errorText(errors.email?.message)}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            {t("form.phone")}{" "}
            <span className="text-navy-400">({t("form.optional")})</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={`mt-1.5 ${inputClass}`}
            {...register("phone")}
          />
        </div>

        <div>
          <label htmlFor="language" className={labelClass}>
            {t("form.language")}
          </label>
          <select
            id="language"
            className={`mt-1.5 ${inputClass}`}
            {...register("language")}
          >
            {contactLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {t(langLabelKey[lang])}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className={labelClass}>
          {t("form.intent")} <span className="text-gold">*</span>
        </legend>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
          {contactIntents.map((intent) => (
            <label
              key={intent}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-navy-200 px-4 py-2.5 text-sm text-navy-800 transition-colors has-checked:border-gold has-checked:bg-blush/40 has-focus-visible:ring-2 has-focus-visible:ring-gold/30"
            >
              <input
                type="radio"
                value={intent}
                className="h-4 w-4 accent-gold"
                aria-invalid={!!errors.intent}
                {...register("intent")}
              />
              {t(intentLabelKey[intent])}
            </label>
          ))}
        </div>
        {errorText(errors.intent?.message)}
      </fieldset>

      <div className="mt-6">
        <label htmlFor="message" className={labelClass}>
          {t("form.message")}{" "}
          <span className="text-navy-400">({t("form.optional")})</span>
        </label>
        <textarea
          id="message"
          rows={4}
          maxLength={2000}
          className={`mt-1.5 ${inputClass} resize-y`}
          placeholder={t("form.messagePlaceholder")}
          {...register("message")}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {isSubmitting ? t("form.submitting") : t("form.submit")}
      </button>

      <p className="mt-4 text-xs text-navy-500">{t("form.requiredNote")}</p>
    </form>
  );
}
