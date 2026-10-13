"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { MonitorPlay, Store, Users, Sparkles } from "lucide-react";

const moments = [
  { id: "screen", icon: MonitorPlay },
  { id: "table", icon: Store },
  { id: "community", icon: Users },
] as const;

// A conceptual brand canvas, deliberately independent of the venue layout.
export function BrandShowcase() {
  const t = useTranslations("christmasGala.screens.showcase");
  const [active, setActive] = useState<(typeof moments)[number]["id"]>("screen");
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <figure className="gala-showcase">
        <div className="gala-moment-controls" role="group" aria-label={t("label")}>
          {moments.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={active === id}
              aria-controls="gala-brand-preview"
              onClick={() => setActive(id)}
            >
              <Icon size={16} aria-hidden="true" />
              {t(`${id}.label`)}
            </button>
          ))}
        </div>
        <div id="gala-brand-preview" className="gala-brand-preview" data-moment={active}>
          <div className="gala-light-strand" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => <i key={i} />)}
          </div>
          <div className="gala-stage-halo" aria-hidden="true" />
          <m.div
            key={active}
            className="gala-brand-art"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {active === "community" && <div className="gala-community-orbit" aria-hidden="true"><Users /><Users /><Users /></div>}
            <div className="gala-brand-screen">
              <Sparkles size={28} strokeWidth={1} aria-hidden="true" />
              <span className="gala-brand-wordmark">{t("brand")}</span>
              <span className="gala-brand-tagline">{t(`${active}.tagline`)}</span>
              <span className="gala-brand-rule" aria-hidden="true" />
              <span className="gala-brand-signature">{t("signature")}</span>
            </div>
            {active === "table" && <div className="gala-display-table" aria-hidden="true"><span /><span /><span /></div>}
            {active === "screen" && <div className="gala-screen-pedestal" aria-hidden="true" />}
          </m.div>
          <div className="gala-preview-caption" aria-live="polite" aria-atomic="true">
            <p>{t(`${active}.title`)}</p>
            <span>{t(`${active}.body`)}</span>
          </div>
        </div>
        <figcaption className="mt-4 text-xs leading-relaxed text-navy-200">{t("note")}</figcaption>
      </figure>
    </LazyMotion>
  );
}
