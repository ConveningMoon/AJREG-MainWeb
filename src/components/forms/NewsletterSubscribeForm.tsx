"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  newsletterSchema,
  type NewsletterFormValues,
} from "@/lib/newsletter-schema";

// Subscription form for the ITMANO newsletter channel.
//
// It POSTs straight to the CRM's public intake endpoint — that endpoint takes
// no secret (it is guarded by a non-guessable channel id + honeypot + schema
// validation) and is the same call the CRM's own hosted archive makes. The URL
// is same-origin because next.config.ts rewrites /api/intake/* to the CRM, so
// the request stays first-party: no CORS, no tracker blockers, and no bot
// check on the other domain — the same reason the measurement script is
// proxied through this domain.
const CHANNEL_ID =
  process.env.NEXT_PUBLIC_ITMANO_NEWSLETTER_CHANNEL_ID ?? "chn_aoad7icta5o2";

const VISITOR_KEY = "itmano_visitor_id";

/** Stable per-browser id so the CRM can tie a page view to its subscription. */
function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

type Status = "idle" | "success" | "duplicate" | "error";

export function NewsletterSubscribeForm({
  editionId,
  tone = "light",
  stacked = false,
  onSuccess,
}: {
  /** Set on an edition page so the CRM knows which edition won the reader. */
  editionId?: string;
  /** `dark` places the form on a navy surface. */
  tone?: "light" | "dark";
  /** One field per row — for narrow columns like the article sidebar, where
   *  the viewport is wide but the form is not. */
  stacked?: boolean;
  onSuccess?: () => void;
}) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  // The page and the modal can both hold a form at once — unique ids keep
  // each label bound to its own input.
  const fieldId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { firstName: "", email: "", website: "" },
  });

  const dark = tone === "dark";

  // The exact sentence shown next to the checkbox. This string, verbatim, is
  // what travels as `consent_text` and is stored by the CRM as the proof of
  // consent — it must never be swapped for a generic one written in code.
  const consentText = t("form.consent");

  const onSubmit = async (values: NewsletterFormValues) => {
    setStatus("idle");
    try {
      const res = await fetch(`/api/intake/${CHANNEL_ID}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: values.firstName,
          email: values.email,
          language: locale === "es" ? "es" : "en",
          consent_text: consentText,
          source_url: window.location.href,
          visitor_id: visitorId(),
          ...(editionId ? { edition_id: editionId } : {}),
          website: values.website ?? "",
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; status?: string }
        | null;

      if (!res.ok || !body?.ok) {
        setStatus("error");
        return;
      }
      // Re-subscribing does not duplicate: the CRM refreshes the existing
      // subscriber and reports it as `already_submitted`.
      setStatus(body.status === "already_submitted" ? "duplicate" : "success");
      reset();
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  };

  // Field error: message is an i18n key relative to the `newsletter` namespace.
  const errorText = (key?: string) =>
    key ? (
      <p
        className={`mt-1.5 text-sm ${dark ? "text-gold" : "text-red-600"}`}
        role="alert"
      >
        {t(key)}
      </p>
    ) : null;

  if (status === "success" || status === "duplicate") {
    return (
      <div
        role="status"
        className={`rounded-2xl p-7 text-center ${
          dark
            ? "bg-navy-800 ring-1 ring-cream/10"
            : "bg-white shadow-sm ring-1 ring-navy-900/5"
        }`}
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
        <p
          className={`mt-4 font-display text-xl font-semibold ${
            dark ? "text-cream" : "text-navy"
          }`}
        >
          {t(
            status === "duplicate"
              ? "result.duplicateTitle"
              : "result.successTitle"
          )}
        </p>
        <p
          className={`mt-2 text-sm leading-relaxed ${
            dark ? "text-cream/70" : "text-navy-600"
          }`}
        >
          {t(
            status === "duplicate" ? "result.duplicateBody" : "result.successBody"
          )}
        </p>
      </div>
    );
  }

  const inputClass = dark
    ? "w-full rounded-lg border border-cream/20 bg-navy-950/40 px-4 py-2.5 text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30"
    : "w-full rounded-lg border border-navy-200 bg-cream/40 px-4 py-2.5 text-navy placeholder:text-navy-400 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className={`grid gap-4 ${stacked ? "" : "sm:grid-cols-2"}`}>
        <div>
          <label htmlFor={`${fieldId}-first-name`} className="sr-only">
            {t("form.firstName")}
          </label>
          <input
            id={`${fieldId}-first-name`}
            type="text"
            autoComplete="given-name"
            placeholder={t("form.firstName")}
            aria-invalid={!!errors.firstName}
            className={inputClass}
            {...register("firstName")}
          />
          {errorText(errors.firstName?.message)}
        </div>
        <div>
          <label htmlFor={`${fieldId}-email`} className="sr-only">
            {t("form.email")}
          </label>
          <input
            id={`${fieldId}-email`}
            type="email"
            autoComplete="email"
            placeholder={t("form.email")}
            aria-invalid={!!errors.email}
            className={inputClass}
            {...register("email")}
          />
          {errorText(errors.email?.message)}
        </div>
      </div>

      {/* Honeypot — hidden from people, offered to bots. Never type="hidden". */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />

      <div>
        <label
          className={`flex cursor-pointer items-start gap-3 text-sm leading-relaxed ${
            dark ? "text-cream/75" : "text-navy-700"
          }`}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#c7a260]"
            aria-invalid={!!errors.consent}
            {...register("consent")}
          />
          <span>{consentText}</span>
        </label>
        {errorText(errors.consent?.message as string | undefined)}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-70 ${
          dark
            ? "bg-gold text-navy-950 hover:bg-gold/90"
            : "bg-navy text-cream hover:bg-navy-800"
        }`}
      >
        {isSubmitting && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {t("form.submit")}
      </button>

      {status === "error" && (
        <p
          role="alert"
          className={`flex items-start gap-2 text-sm ${
            dark ? "text-gold" : "text-red-600"
          }`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t("result.errorBody")}
        </p>
      )}
    </form>
  );
}
