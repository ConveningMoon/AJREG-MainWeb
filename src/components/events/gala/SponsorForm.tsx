"use client";

import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Clapperboard, Loader2 } from "lucide-react";
import {
  formatUsd,
  getSponsorTier,
  sponsorTierIds,
  sponsorTiers,
  type SponsorTierId,
} from "@/data/christmasGala";
import {
  raffleChoices,
  sponsorApplicationSchema,
  sponsorIndustries,
  type SponsorApplicationValues,
} from "@/lib/sponsor-schema";
import { brand } from "@/lib/brand";
import { TIER_EVENT } from "./tier-select";

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full rounded-lg border border-navy-200 bg-cream/60 px-4 py-3 text-navy placeholder:text-navy-400 outline-none transition-colors focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-red-400";
const labelClass = "block text-sm font-semibold text-navy-800";
const hintClass = "ml-1 font-normal text-navy-400";
const errorClass = "mt-1.5 flex items-center gap-1.5 text-sm text-red-700";

export function SponsorForm({ deadline }: { deadline: string }) {
  const t = useTranslations("christmasGala");
  const locale = useLocale();
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [sentTier, setSentTier] = useState<SponsorTierId | null>(null);
  // Checked on the client clock after mount; the API enforces it too.
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const check = () => setClosed(Date.now() > new Date(deadline).getTime());
    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<SponsorApplicationValues>({
    resolver: zodResolver(sponsorApplicationSchema),
    defaultValues: {
      tier: undefined,
      businessName: "",
      industry: undefined,
      businessLink: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      wantsVideo: true,
      raffle: "maybe",
      raffleItem: "",
      message: "",
      fax: "",
    },
  });

  const tier = useWatch({ control, name: "tier" });
  const raffle = useWatch({ control, name: "raffle" });
  const selected = tier ? getSponsorTier(tier) : null;

  // Tier buttons elsewhere on the page, or ?tier=gold in a shared link.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tier");
    if (fromUrl && (sponsorTierIds as readonly string[]).includes(fromUrl)) {
      setValue("tier", fromUrl as SponsorTierId, { shouldValidate: false });
    }
    const onSelect = (event: Event) => {
      const next = (event as CustomEvent<SponsorTierId>).detail;
      setValue("tier", next, { shouldValidate: true });
      setStatus((s) => (s === "success" ? "idle" : s));
    };
    window.addEventListener(TIER_EVENT, onSelect);
    return () => window.removeEventListener(TIER_EVENT, onSelect);
  }, [setValue]);

  const onSubmit = async (data: SponsorApplicationValues) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && json?.ok) {
        setSentTier(data.tier);
        setStatus("success");
        reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const err = (key?: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    key ? t(`form.${key}` as any) : null;

  if (closed) {
    return (
      <div role="status" className="py-10 text-center">
        <h3 className="font-display text-3xl font-semibold text-navy text-balance">{t("form.closed.title")}</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">{t("form.closed.body")}</p>
        <a
          href={brand.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-[#d4b273] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          {t("close.whatsapp")}
        </a>
      </div>
    );
  }

  if (status === "success" && sentTier) {
    return (
      <div role="status" className="py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" aria-hidden="true" />
        <h3 className="mt-5 font-display text-3xl font-semibold text-navy text-balance">
          {t("form.success.title")}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-navy-600">
          {t("form.success.body", { tier: t(`tiers.${sentTier}`) })}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 inline-flex items-center justify-center rounded-sm border border-navy-300 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("form.success.again")}
        </button>
      </div>
    );
  }

  const fieldId = (name: string) => `${uid}-${name}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      {/* Package */}
      <fieldset>
        <legend className="font-display text-2xl font-semibold text-navy">{t("form.fields.tier")}</legend>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {sponsorTiers.map((option) => {
            const checked = tier === option.id;
            return (
              <label
                key={option.id}
                className={`relative flex cursor-pointer flex-col rounded-lg border px-4 py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                  checked
                    ? "border-navy-900 bg-navy-900 text-cream"
                    : "border-navy-200 bg-white text-navy hover:border-gold"
                }`}
              >
                <input type="radio" value={option.id} {...register("tier")} className="sr-only" />
                <span className="text-sm font-semibold">{t(`tiers.${option.id}`)}</span>
                <span className={`mt-1 font-display text-2xl font-semibold tabular-nums ${checked ? "text-gold" : "text-navy"}`}>
                  {formatUsd(option.priceUsd)}
                </span>
                <span className={`mt-1 text-xs ${checked ? "text-navy-100" : "text-navy-500"}`}>
                  {t("packages.tickets", { count: option.tickets })}
                </span>
                {checked && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-gold" aria-hidden="true" />
                )}
              </label>
            );
          })}
        </div>
        {errors.tier && (
          <p className={errorClass} role="alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {err(errors.tier.message)}
          </p>
        )}
      </fieldset>

      {/* Business */}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-2xl font-semibold text-navy">{t("form.steps.business")}</legend>
        <div className="sm:col-span-2">
          <label htmlFor={fieldId("businessName")} className={labelClass}>{t("form.fields.businessName")}</label>
          <input
            id={fieldId("businessName")}
            autoComplete="organization"
            aria-invalid={!!errors.businessName}
            {...register("businessName")}
            className={`mt-1.5 ${inputClass}`}
          />
          {errors.businessName && <p className={errorClass}>{err(errors.businessName.message)}</p>}
        </div>
        <div>
          <label htmlFor={fieldId("industry")} className={labelClass}>{t("form.fields.industry")}</label>
          <select
            id={fieldId("industry")}
            aria-invalid={!!errors.industry}
            defaultValue=""
            {...register("industry")}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="" disabled>{t("form.fields.industryPlaceholder")}</option>
            {sponsorIndustries.map((value) => (
              <option key={value} value={value}>{t(`form.industries.${value}`)}</option>
            ))}
          </select>
          {errors.industry && <p className={errorClass}>{err(errors.industry.message)}</p>}
        </div>
        <div>
          <label htmlFor={fieldId("businessLink")} className={labelClass}>
            {t("form.fields.businessLink")}
            <span className={hintClass}>· {t("form.fields.businessLinkHint")}</span>
          </label>
          <input
            id={fieldId("businessLink")}
            autoComplete="url"
            inputMode="url"
            {...register("businessLink")}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </fieldset>

      {/* Contact */}
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-2xl font-semibold text-navy">{t("form.steps.contact")}</legend>
        {(
          [
            ["firstName", "given-name", "text"],
            ["lastName", "family-name", "text"],
            ["email", "email", "email"],
            ["phone", "tel", "tel"],
          ] as const
        ).map(([name, autoComplete, type]) => (
          <div key={name}>
            <label htmlFor={fieldId(name)} className={labelClass}>{t(`form.fields.${name}`)}</label>
            <input
              id={fieldId(name)}
              type={type}
              autoComplete={autoComplete}
              aria-invalid={!!errors[name]}
              {...register(name)}
              className={`mt-1.5 ${inputClass}`}
            />
            {errors[name] && <p className={errorClass}>{err(errors[name]?.message)}</p>}
          </div>
        ))}
      </fieldset>

      {/* Extras */}
      <fieldset className="space-y-6">
        <legend className="mb-4 font-display text-2xl font-semibold text-navy">{t("form.steps.extras")}</legend>

        {selected?.videoProduction ? (
          <label className="flex cursor-pointer items-start gap-4 rounded-lg bg-navy-900 p-5 text-cream">
            <input
              type="checkbox"
              {...register("wantsVideo")}
              className="mt-1 h-5 w-5 shrink-0 accent-[#c7a260]"
            />
            <span>
              <span className="flex items-center gap-2 font-semibold">
                <Clapperboard className="h-4 w-4 text-gold" aria-hidden="true" />
                {t("form.fields.wantsVideo")}
              </span>
              <span className="mt-1 block text-sm text-navy-100">{t("form.fields.wantsVideoHint")}</span>
            </span>
          </label>
        ) : selected ? (
          <p className="rounded-lg bg-blush/50 px-5 py-4 text-sm text-taupe">{t("form.fields.videoNotIncluded")}</p>
        ) : null}

        {selected?.id !== "community" && (
          <div>
            <p id={fieldId("raffle")} className={labelClass}>{t("form.fields.raffle")}</p>
            <div role="radiogroup" aria-labelledby={fieldId("raffle")} className="mt-2 flex flex-wrap gap-2">
              {raffleChoices.map((choice) => (
                <label
                  key={choice}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                    raffle === choice
                      ? "border-navy-900 bg-navy-900 text-cream"
                      : "border-navy-200 bg-white text-navy-700 hover:border-gold"
                  }`}
                >
                  <input type="radio" value={choice} {...register("raffle")} className="sr-only" />
                  {t(`form.raffleOptions.${choice}`)}
                </label>
              ))}
            </div>
            {raffle !== "no" && (
              <div className="mt-4">
                <label htmlFor={fieldId("raffleItem")} className={labelClass}>
                  {t("form.fields.raffleItem")}
                  <span className={hintClass}>· {t("form.fields.messageHint")}</span>
                </label>
                <input
                  id={fieldId("raffleItem")}
                  placeholder={t("form.fields.raffleItemPlaceholder")}
                  {...register("raffleItem")}
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor={fieldId("message")} className={labelClass}>
            {t("form.fields.message")}
            <span className={hintClass}>· {t("form.fields.messageHint")}</span>
          </label>
          <textarea
            id={fieldId("message")}
            rows={3}
            {...register("message")}
            className={`mt-1.5 resize-y ${inputClass}`}
          />
        </div>
      </fieldset>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Fax
          <input tabIndex={-1} autoComplete="off" {...register("fax")} />
        </label>
      </div>

      <div className="border-t border-navy-100 pt-8">
        {status === "error" && (
          <p role="alert" className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {t("form.error")}{" "}
              <a href={brand.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                WhatsApp
              </a>
            </span>
          </p>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-navy-500">{t("form.privacy")}</p>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-8 py-4 text-base font-semibold text-navy-950 transition-colors hover:bg-[#d4b273] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 disabled:cursor-wait disabled:opacity-70"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                {t("form.submitting")}
              </>
            ) : (
              <>
                {t("form.submit")}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
