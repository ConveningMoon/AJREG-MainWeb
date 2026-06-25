"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return value;
}

export function Stats() {
  const t = useTranslations("home.stats");
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const houses   = useCountUp(361, 1400, visible);
  const families = useCountUp(37,  1100, visible);
  const years    = useCountUp(16,  900,  visible);

  const stats = [
    { value: `+${houses}`,   label: t("housesLabel") },
    { value: `+${families}`, label: t("familiesLabel") },
    { value: `+${years}`,    label: t("yearsLabel") },
  ];

  return (
    <section ref={ref} className="bg-navy-900 text-cream">
      <div className="mx-auto grid max-w-7xl px-6 py-10 sm:grid-cols-3 lg:py-14">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-8 py-5 ${
              i > 0 ? "border-t border-gold/20 sm:border-t-0 sm:border-l sm:border-gold/20" : ""
            }`}
          >
            <div className="flex flex-col items-baseline gap-x-2 gap-y-1 items-center">
              <p
                className="font-display font-semibold text-gold tabular-nums"
                style={{ fontSize: "clamp(2.75rem, 5.5vw, 5.5rem)", lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p className="text-xs font-medium uppercase leading-tight tracking-wider text-navy-200">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
