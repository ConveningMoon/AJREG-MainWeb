"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Loader2, Users } from "lucide-react";
import { buildGalaRsvpPayload, GALA_RSVP_CHANNEL, galaRsvpSchema, type GalaRsvpValues } from "@/lib/gala-rsvp";
import { galaEvent } from "@/data/christmasGala";

export function RsvpForm() {
  const t = useTranslations("galaRsvp");
  const locale = useLocale() === "es" ? "es" : "en";
  const reduce = useReducedMotion();
  const lock = useRef(false);
  const [status, setStatus] = useState<"idle" | "error" | "created" | "already_submitted">("idle");
  const [total, setTotal] = useState("0");
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<GalaRsvpValues>({
    resolver: zodResolver(galaRsvpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", extraGuests: "0", website: "" },
  });
  const extra = useWatch({ control, name: "extraGuests" });
  const onSubmit = async (values: GalaRsvpValues) => {
    if (lock.current) return;
    lock.current = true;
    setStatus("idle");
    try {
      if (values.website) return;
      const response = await fetch(`/api/intake/${GALA_RSVP_CHANNEL}/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGalaRsvpPayload(values, locale, window.location.href, t)),
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.ok !== true || !["created", "already_submitted"].includes(body.status)) throw new Error("RSVP failed");
      setTotal(values.extraGuests);
      setStatus(body.status);
    } catch { setStatus("error"); }
    finally { lock.current = false; }
  };

  return <LazyMotion features={domAnimation}>
    {status === "created" || status === "already_submitted" ? (
      <m.div role="status" tabIndex={-1} ref={(node) => node?.focus()} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="gala-rsvp-success">
        <span className="gala-rsvp-check"><Check aria-hidden="true" /></span>
        <p className="gala-rsvp-eyebrow">{t("success.eyebrow")}</p>
        <h2>{t(`success.${status}Title`)}</h2>
        <p>{t(`success.${status}Body`)}</p>
        {status === "created" && <p className="gala-rsvp-total"><Users size={18} aria-hidden="true" />{t(`form.totals.${total}`)}</p>}
        <a className="gala-rsvp-map" href={galaEvent.venueMapUrl} target="_blank" rel="noopener noreferrer">{galaEvent.venueName}<ArrowUpRight size={16} aria-hidden="true" /></a>
      </m.div>
    ) : (
      <form onSubmit={(event) => { void handleSubmit(onSubmit)(event); }} noValidate aria-labelledby="rsvp-title">
        <p className="gala-rsvp-eyebrow">{t("form.eyebrow")}</p>
        <h2 id="rsvp-title">{t("form.title")}</h2>
        <p className="gala-rsvp-form-intro">{t("form.lead")}</p>
        <div className="gala-rsvp-fields">
          {(["firstName", "lastName", "email", "phone"] as const).map((name) => <div key={name} className={name === "email" || name === "phone" ? "gala-rsvp-full" : ""}>
            <label htmlFor={`rsvp-${name}`}>{t(`form.${name}`)}{(name === "lastName" || name === "phone") && <span className="gala-rsvp-optional"> {t("form.optional")}</span>}</label>
            <input id={`rsvp-${name}`} type={name === "email" ? "email" : name === "phone" ? "tel" : "text"} autoComplete={{ firstName: "given-name", lastName: "family-name", email: "email", phone: "tel" }[name]} required={name === "firstName" || name === "email"} maxLength={name === "email" ? 254 : name === "phone" ? 40 : 120} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `rsvp-${name}-error` : undefined} {...register(name)} />
            {errors[name] && <p id={`rsvp-${name}-error`} role="alert" className="gala-rsvp-error">{t(`errors.${errors[name].message}`)}</p>}
          </div>)}
        </div>
        <fieldset className="gala-rsvp-guests">
          <legend>{t("form.extraGuests")}</legend>
          <p id="rsvp-guests-help">{t("form.guestHelp")}</p>
          <div className="gala-rsvp-choices">{(["0", "1"] as const).map((count) => <label key={count}>
            <input type="radio" value={count} aria-describedby="rsvp-guests-help" {...register("extraGuests")} /><span>{t(`form.guests.${count}`)}</span>
          </label>)}</div>
          {errors.extraGuests && <p role="alert" className="gala-rsvp-error">{t("errors.guestInvalid")}</p>}
        </fieldset>
        <p className="gala-rsvp-total" aria-live="polite"><Users size={18} aria-hidden="true" />{t(`form.totals.${extra}`)}</p>
        <div hidden aria-hidden="true"><label htmlFor="rsvp-website">{t("form.website")}</label><input id="rsvp-website" tabIndex={-1} autoComplete="off" {...register("website")} /></div>
        {status === "error" && <p role="alert" className="gala-rsvp-error">{t("errors.submit")}</p>}
        <m.button type="submit" disabled={isSubmitting} whileTap={reduce ? undefined : { scale: .985 }} className="gala-rsvp-submit">
          {isSubmitting ? <Loader2 className={reduce ? "" : "animate-spin"} size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}{t(isSubmitting ? "form.submitting" : "form.submit")}
        </m.button>
        <p className="gala-rsvp-note">{t("form.note")}</p>
      </form>
    )}
  </LazyMotion>;
}
