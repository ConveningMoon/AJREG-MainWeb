"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { Snowflake } from "lucide-react";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { HolidaySprig } from "./HolidaySprig";
import { galaEvent } from "@/data/christmasGala";

// Keep the physical sequence, compressed to about 1.5 seconds.
const OPENING_TIME_SCALE = .6;

export function RsvpEnvelope({ children }: { children: React.ReactNode }) {
  const t = useTranslations("galaRsvp.envelope");
  const tPage = useTranslations("galaRsvp");
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">("sealed");
  const opening = phase === "opening";
  const shellAnimation = { y: opening && !reduce ? "110%" : "0%" };
  const shellTransition = { duration: reduce ? 0 : .85 * OPENING_TIME_SCALE, delay: opening && !reduce ? 1.5 * OPENING_TIME_SCALE : 0, ease: [.45, 0, .2, 1] as const };

  useEffect(() => {
    if (phase === "open") document.getElementById("invitation-title")?.focus({ preventScroll: true });
  }, [phase]);

  return (
    <LazyMotion features={domAnimation}>
      {phase !== "open" && (
        <m.section className="gala-envelope" aria-label={t("label")} data-opening={opening}
          initial={false} animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: reduce ? .12 : .3 * OPENING_TIME_SCALE, delay: opening && !reduce ? 2.25 * OPENING_TIME_SCALE : 0 }}
          onAnimationComplete={() => { if (opening) setPhase("open"); }}>
          <m.div className="gala-envelope-back" aria-hidden="true" initial={false} animate={shellAnimation} transition={shellTransition}>
            <div className="gala-envelope-paper" />
          </m.div>
          <m.div className="gala-envelope-letter" aria-hidden="true" initial={false}
            animate={{ y: opening && !reduce ? "-44%" : "24%", rotate: opening && !reduce ? -2 : 0, scale: opening && !reduce ? 1.04 : 1 }}
            transition={{ duration: reduce ? 0 : 1.15 * OPENING_TIME_SCALE, delay: opening && !reduce ? .65 * OPENING_TIME_SCALE : 0, ease: [.22, 1, .36, 1] }}>
            <Image src="/images/logo-white_2.webp" width={160} height={96} alt="" className="gala-envelope-logo" />
            <p className="gala-envelope-letter-eyebrow">{tPage("eyebrow")}</p>
            <p className="gala-envelope-letter-title">{tPage("title")}<em>{tPage("titleAccent")}</em></p>
            <Snowflake size={30} strokeWidth={1} />
            <p className="gala-envelope-signature">{t("signature")}</p>
          </m.div>
          <m.div className="gala-envelope-front" initial={false} animate={shellAnimation} transition={shellTransition}>
            <div className="gala-envelope-fold gala-envelope-fold-left" aria-hidden="true" />
            <div className="gala-envelope-fold gala-envelope-fold-right" aria-hidden="true" />
            <div className="gala-envelope-fold gala-envelope-fold-bottom" aria-hidden="true" />
            <m.div className="gala-envelope-flap" aria-hidden="true" initial={false}
              animate={{ rotateX: opening && !reduce ? -175 : 0 }}
              transition={{ duration: reduce ? 0 : .95 * OPENING_TIME_SCALE, delay: opening && !reduce ? .15 * OPENING_TIME_SCALE : 0, ease: [.45, 0, .2, 1] }} />
            <HolidaySprig className="gala-envelope-sprig gala-envelope-sprig-left" />
            <HolidaySprig className="gala-envelope-sprig gala-envelope-sprig-right" />
            <m.div className="gala-envelope-heading" initial={false} animate={{ opacity: opening ? 0 : 1 }} transition={{ duration: reduce ? 0 : .25 * OPENING_TIME_SCALE }}>
              <Link href="/" className="gala-envelope-home" aria-label={tPage("home")}><Image src="/images/logo-white_2.webp" width={160} height={96} alt="A&J Real Estate Group" className="gala-envelope-logo" priority /></Link>
              <p>{t("eyebrow")}</p><h2>{t("title")}</h2>
            </m.div>
            <m.button type="button" className="gala-envelope-seal" onClick={() => setPhase("opening")}
              aria-label={t("open")} aria-controls="gala-invitation-content" aria-expanded={opening} disabled={opening} initial={false}
              animate={{ opacity: opening ? 0 : 1, y: opening && !reduce ? 24 : 0, rotate: opening && !reduce ? -12 : 0, scale: opening && !reduce ? .88 : 1 }}
              whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: .96 }} transition={{ duration: reduce ? .1 : .3 * OPENING_TIME_SCALE }}>
              <Snowflake size={24} strokeWidth={1} aria-hidden="true" /><span aria-hidden="true">A&amp;J</span>
              <span className="gala-envelope-seal-year" aria-hidden="true">{galaEvent.startsAt.slice(0, 4)}</span>
            </m.button>
            <m.div className="gala-envelope-closing" initial={false} animate={{ opacity: opening ? 0 : 1 }} transition={{ duration: reduce ? 0 : .25 * OPENING_TIME_SCALE }}>
              <p className="gala-envelope-prompt">{t("open")}</p><p className="gala-envelope-signature">{t("signature")}</p>
            </m.div>
          </m.div>
          <LocaleSwitcher className="gala-envelope-language" />
        </m.section>
      )}
      <m.div id="gala-invitation-content" className="gala-revealed" style={{ display: phase === "sealed" ? "none" : "block" }}
        inert={opening} aria-hidden={opening ? true : undefined} initial={false}
        animate={{ opacity: phase === "sealed" ? 0 : 1 }} transition={{ duration: reduce ? 0 : .2 * OPENING_TIME_SCALE, delay: opening && !reduce ? 1.5 * OPENING_TIME_SCALE : 0 }}>
        {children}
      </m.div>
      <noscript><style>{"html{overflow:auto!important}.gala-envelope,#rsvp form{display:none}.gala-revealed{display:block!important;opacity:1!important}"}</style><p className="gala-noscript-note">{t("javascript")}</p></noscript>
    </LazyMotion>
  );
}
