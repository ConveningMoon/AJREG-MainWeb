"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useCompactCountdown } from "./Countdown";
import { selectTierAndScroll } from "./tier-select";

// Appears once the hero has scrolled away and steps aside over the package
// comparison and the application form, which carry their own actions.
export function StickyApplyBar() {
  const t = useTranslations("christmasGala.countdown");
  const time = useCompactCountdown();
  const [heroGone, setHeroGone] = useState(false);
  const [zoneVisible, setZoneVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("gala-hero");
    // Where the visitor is already choosing or applying, the bar steps aside.
    const zones = ["packages", "apply"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visibleZones = new Set<Element>();
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([entry]) => setHeroGone(!entry.isIntersecting), {
        threshold: 0,
      });
      o.observe(hero);
      observers.push(o);
    }
    if (zones.length) {
      const o = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visibleZones.add(entry.target);
            else visibleZones.delete(entry.target);
          }
          setZoneVisible(visibleZones.size > 0);
        },
        { rootMargin: "0px 0px -35% 0px" },
      );
      zones.forEach((zone) => o.observe(zone));
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const shown = heroGone && !zoneVisible && time !== null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:px-6 sm:pb-5 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      inert={!shown}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-md bg-navy-950/95 py-2.5 pl-5 pr-2.5 text-cream shadow-[0_18px_40px_-12px_rgb(10_19_33/0.55)] ring-1 ring-gold/30">
        <p className="text-sm leading-snug">
          <span className="hidden sm:inline">{t("bar")}</span>
          <span className="sm:hidden">{t("barShort")}</span>{" "}
          <span className="whitespace-nowrap font-display text-lg font-semibold tabular-nums text-gold">{time}</span>
        </p>
        <button
          type="button"
          onClick={() => selectTierAndScroll()}
          className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-[#d4b273] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("barApply")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
