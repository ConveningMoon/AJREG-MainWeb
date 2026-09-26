"use client";

import { FormEvent, useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  Users,
} from "lucide-react";
import type { PublicOpenHouse } from "@/lib/open-houses";

type Countdown =
  | { state: "upcoming"; days: number; hours: number; minutes: number; seconds: number }
  | { state: "live" }
  | { state: "ended" };

function getCountdown(openHouse: PublicOpenHouse, now: number): Countdown {
  const startsAt = new Date(openHouse.starts_at).getTime();
  const endsAt = new Date(openHouse.ends_at).getTime();

  if (now >= endsAt) return { state: "ended" };
  if (now >= startsAt) return { state: "live" };

  const remainingSeconds = Math.max(0, Math.floor((startsAt - now) / 1000));
  return {
    state: "upcoming",
    days: Math.floor(remainingSeconds / 86_400),
    hours: Math.floor((remainingSeconds % 86_400) / 3_600),
    minutes: Math.floor((remainingSeconds % 3_600) / 60),
    seconds: remainingSeconds % 60,
  };
}

type SubmitStatus =
  | { state: "idle" }
  | { state: "created" | "updated" }
  | { state: "error"; message: string };

const subscribeToTimeZone = () => () => {};
const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const getServerTimeZone = () => null;

export function OpenHousePanel({
  openHouse,
  locale,
}: {
  openHouse: PublicOpenHouse;
  locale: string;
}) {
  const t = useTranslations("houses.detail.openHouse");
  const fieldId = useId();
  const [now, setNow] = useState(() => new Date(openHouse.fetched_at).getTime());
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ state: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const viewerTimeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getBrowserTimeZone,
    getServerTimeZone
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const countdown = getCountdown(openHouse, now);

  const eventDate = useMemo(() => {
    if (!viewerTimeZone) return null;

    try {
      return new Intl.DateTimeFormat(locale, {
        timeZone: viewerTimeZone,
        dateStyle: "full",
      }).format(new Date(openHouse.starts_at));
    } catch {
      return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(
        new Date(openHouse.starts_at)
      );
    }
  }, [locale, openHouse.starts_at, viewerTimeZone]);

  const eventTime = useMemo(() => {
    if (!viewerTimeZone) return null;

    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        timeZone: viewerTimeZone,
        timeStyle: "short",
      });
      return `${formatter.format(new Date(openHouse.starts_at))}–${formatter.format(
        new Date(openHouse.ends_at)
      )}`;
    } catch {
      const formatter = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
      return `${formatter.format(new Date(openHouse.starts_at))}–${formatter.format(
        new Date(openHouse.ends_at)
      )}`;
    }
  }, [locale, openHouse.ends_at, openHouse.starts_at, viewerTimeZone]);

  if (countdown.state === "ended") return null;

  const isCancelled = openHouse.status === "cancelled";
  const canRsvp = openHouse.rsvp_enabled && !isCancelled;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus({ state: "idle" });
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await fetch(
        `https://app.itmano.com/api/open-houses/${openHouse.id}/rsvp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: String(formData.get("first_name") ?? "").trim(),
            last_name: String(formData.get("last_name") ?? "").trim() || undefined,
            email: String(formData.get("email") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim() || undefined,
            language: locale === "es" ? "es" : "en",
            response: "yes",
            guests: Number(formData.get("guests") ?? 0),
            website: String(formData.get("website") ?? ""),
          }),
        }
      );

      const body = (await result.json().catch(() => null)) as
        | { ok?: boolean; status?: "created" | "updated"; error?: string }
        | null;

      if (!result.ok || !body?.ok) {
        setSubmitStatus({
          state: "error",
          message: body?.error || t("form.genericError"),
        });
        return;
      }

      setSubmitStatus({ state: body.status === "updated" ? "updated" : "created" });
      form.reset();
    } catch {
      setSubmitStatus({ state: "error", message: t("form.genericError") });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-navy-400 bg-cream px-3.5 py-3 text-sm text-navy-900 caret-gold outline-none transition-[border-color,box-shadow] placeholder:text-navy-500 focus:border-gold focus:ring-2 focus:ring-navy-700 focus:ring-offset-1 focus:ring-offset-white";

  return (
    <section
      aria-labelledby="open-house-title"
      className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/10"
    >
      <div className={`grid ${canRsvp ? "lg:grid-cols-[0.9fr_1.1fr]" : ""}`}>
        <div className="relative overflow-hidden bg-navy-900 p-6 text-cream sm:p-8 lg:p-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-gold/20" aria-hidden="true" />
          <div className="absolute -right-5 -top-8 h-32 w-32 rounded-full border border-gold/25" aria-hidden="true" />

          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gold">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {t("label")}
            </div>
            <h2 id="open-house-title" className="mt-4 max-w-xl font-display text-3xl font-semibold sm:text-4xl">
              {isCancelled ? t("cancelledTitle") : t("title")}
            </h2>

            <div className="mt-6 space-y-3 text-sm text-navy-100">
              {viewerTimeZone && eventDate && eventTime ? (
                <>
                  <p className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                    <time dateTime={openHouse.starts_at}>{eventDate}</time>
                  </p>
                  <p className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                    <span>
                      {eventTime} · {t("localTimeZone", { timeZone: viewerTimeZone })}
                    </span>
                  </p>
                </>
              ) : (
                <p className="flex items-start gap-3" aria-live="polite">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span>{t("localTimeLoading")}</span>
                </p>
              )}
            </div>

            {openHouse.public_notes && (
              <div className="mt-6 border-t border-navy-700 pt-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                  {t("notesLabel")}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-100">
                  {openHouse.public_notes}
                </p>
              </div>
            )}

            {isCancelled ? (
              <div role="status" className="mt-7 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-cream ring-1 ring-white/15">
                {t("cancelledMessage")}
              </div>
            ) : countdown.state === "live" ? (
              <div role="status" aria-live="polite" className="mt-7 rounded-xl bg-gold px-4 py-3 font-semibold text-navy-950">
                {t("live")}
              </div>
            ) : (
              <div className="mt-7" role="timer" aria-label={t("countdownLabel")}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-navy-300">
                  {t("startsIn")}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 min-[360px]:grid-cols-4 min-[360px]:gap-x-2">
                  {(
                    [
                      [countdown.days, t("units.days")],
                      [countdown.hours, t("units.hours")],
                      [countdown.minutes, t("units.minutes")],
                      [countdown.seconds, t("units.seconds")],
                    ] as const
                  ).map(([value, label]) => (
                    <div key={label} className="border-t border-gold/40 pt-3">
                      <span className="block font-display text-3xl font-semibold tabular-nums text-cream sm:text-4xl">
                        {String(value).padStart(2, "0")}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-navy-300">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isCancelled && (
              <a
                href={`https://app.itmano.com/api/open-houses/${openHouse.id}/ics`}
                className="mt-7 inline-flex items-center gap-2 rounded-sm border border-gold/60 px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                {t("addToCalendar")}
              </a>
            )}
          </div>
        </div>

        {canRsvp && (
          <div className="p-6 sm:p-8 lg:p-10">
            {submitStatus.state === "created" || submitStatus.state === "updated" ? (
              <div role="status" className="flex min-h-full flex-col justify-center py-8">
                <CheckCircle2 className="h-10 w-10 text-emerald-700" aria-hidden="true" />
                <h3 className="mt-4 font-display text-3xl font-semibold text-navy">
                  {t(`form.${submitStatus.state}Title`)}
                </h3>
                <p className="mt-2 max-w-lg leading-relaxed text-navy-600">
                  {t(`form.${submitStatus.state}Body`)}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="font-display text-3xl font-semibold text-navy">{t("form.title")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{t("form.subtitle")}</p>
                </div>

                {submitStatus.state === "error" && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <p>{submitStatus.message}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-navy-800" htmlFor={`${fieldId}-first-name`}>
                    {t("form.firstName")} <span className="text-red-700">*</span>
                    <input id={`${fieldId}-first-name`} name="first_name" required autoComplete="given-name" className={inputClass} />
                  </label>
                  <label className="text-sm font-semibold text-navy-800" htmlFor={`${fieldId}-last-name`}>
                    {t("form.lastName")} <span className="font-normal text-navy-500">({t("form.optional")})</span>
                    <input id={`${fieldId}-last-name`} name="last_name" autoComplete="family-name" className={inputClass} />
                  </label>
                  <label className="text-sm font-semibold text-navy-800" htmlFor={`${fieldId}-email`}>
                    {t("form.email")} <span className="text-red-700">*</span>
                    <input id={`${fieldId}-email`} name="email" type="email" required autoComplete="email" className={inputClass} />
                  </label>
                  <label className="text-sm font-semibold text-navy-800" htmlFor={`${fieldId}-phone`}>
                    {t("form.phone")} <span className="font-normal text-navy-500">({t("form.optional")})</span>
                    <input id={`${fieldId}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" className={inputClass} />
                  </label>
                </div>

                <label className="block max-w-xs text-sm font-semibold text-navy-800" htmlFor={`${fieldId}-guests`}>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gold" aria-hidden="true" />
                    {t("form.guests")}
                  </span>
                  <input
                    id={`${fieldId}-guests`}
                    name="guests"
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    defaultValue={0}
                    className={inputClass}
                  />
                </label>

                <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-5 py-3.5 text-sm font-semibold text-navy-950 transition-[background-color,box-shadow] hover:bg-[#d4b270] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {isSubmitting ? t("form.submitting") : t("form.submit")}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
