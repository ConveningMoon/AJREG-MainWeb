"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { galaEvent } from "@/data/christmasGala";

const DEADLINE = new Date(galaEvent.sponsorDeadline).getTime();

type Parts = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function partsUntil(target: number, now: number): Parts {
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: ms === 0,
  };
}

// Null until mounted so the server render and hydration never disagree on
// the clock; the frame renders with dashes for that first instant.
export function useDeadlineCountdown() {
  const [parts, setParts] = useState<Parts | null>(null);
  useEffect(() => {
    const tick = () => setParts(partsUntil(DEADLINE, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return parts;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ deadlineLabel }: { deadlineLabel: string }) {
  const t = useTranslations("christmasGala.countdown");
  const parts = useDeadlineCountdown();

  if (parts?.done) {
    return <p className="font-display text-2xl text-cream">{t("closedLabel")}</p>;
  }

  const units = [
    { key: "days", value: parts ? String(parts.days) : "–" },
    { key: "hours", value: parts ? pad(parts.hours) : "–" },
    { key: "minutes", value: parts ? pad(parts.minutes) : "–" },
    { key: "seconds", value: parts ? pad(parts.seconds) : "–" },
  ] as const;

  return (
    <div>
      <p id="gala-countdown-label" className="text-sm font-medium text-navy-200">
        {t("label")}
      </p>
      {/* The visual clock ticks every second; assistive tech gets one stable
          sentence instead of a live region announcing every tick. */}
      <div
        role="timer"
        aria-labelledby="gala-countdown-label"
        aria-live="off"
        className="mt-3 flex items-end gap-1 sm:gap-2"
      >
        {units.map((unit, i) => (
          <div key={unit.key} className="flex items-end gap-1 sm:gap-2">
            {i > 0 && (
              <span className="pb-6 font-display text-3xl leading-none text-gold/40 sm:text-4xl" aria-hidden="true">
                :
              </span>
            )}
            <div className="flex min-w-[3.25rem] flex-col items-center sm:min-w-[4.25rem]">
              <span className="font-display text-5xl font-semibold leading-none tabular-nums text-gold sm:text-6xl">
                {unit.value}
              </span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-200">
                {t(unit.key)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-navy-200">{deadlineLabel}</p>
    </div>
  );
}

// Compact "6d 04h 12m" for the sticky bar.
export function useCompactCountdown() {
  const parts = useDeadlineCountdown();
  if (!parts || parts.done) return null;
  return `${parts.days}d ${pad(parts.hours)}h ${pad(parts.minutes)}m`;
}
