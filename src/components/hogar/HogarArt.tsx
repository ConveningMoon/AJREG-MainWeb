// Authored artwork for /hogar (the "carpa" world): striped awning, papel-picado
// flags (also the progress meter), the casita illustration, hanging tag and
// the little people that count the household. Flat shapes with a navy
// outline, like a hand-painted sign. All decorative: aria-hidden unless noted.

import styles from "./Hogar.module.css";

export const INK = "#102037";
export const PINK = "#c8185f";
export const TEAL = "#0a7a76";
export const CREAM = "#fff7f5";
export const MARIGOLD = "#f7b500";
const SUN = "#ffd45a";

/** Striped scalloped awning, tiled so it spans any width. */
export function Awning() {
  return <div aria-hidden="true" className={styles.awning} />;
}

const FLAG_COLORS = [PINK, TEAL, CREAM, INK, PINK] as const;

/**
 * Bunting string used as the progress meter: one papel-picado flag per step
 * (4 questions + the last step). Flags up to `done` are painted, the rest are
 * outlines waiting for their colour.
 */
export function Bunting({ done, total = 5, label }: { done: number; total?: number; label: string }) {
  const step = 300 / total;
  return (
    <svg
      viewBox="0 0 300 46"
      className="h-11 w-full"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={Math.min(done, total)}
    >
      <path d="M2 6 Q150 18 298 6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: total }, (_, i) => {
        const cx = step * i + step / 2;
        const sag = 6 + 12 * (1 - Math.pow((cx - 150) / 150, 2)) * 0.5;
        const filled = i < done;
        return (
          <g key={i} transform={`translate(${cx - 18} ${sag})`}>
            {/* Position lives on the outer <g>; the inner one owns the CSS wobble. */}
            <g className={styles.flag} data-filled={filled}>
            <path
              d="M0 0H36V25l-6 7-6-7-6 7-6-7-6 7-6-7Z"
              fill={filled ? FLAG_COLORS[i % FLAG_COLORS.length] : "transparent"}
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="11" r="4" fill={filled ? MARIGOLD : "transparent"} stroke={INK} strokeWidth="1.5" opacity={filled ? 1 : 0.35} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** The family's casita under a string of flags. */
export function Casita({ className }: { className?: string }) {
  const flags = [PINK, TEAL, CREAM, INK, PINK, TEAL, CREAM];
  return (
    <svg viewBox="0 0 280 176" className={className} fill="none" aria-hidden="true" strokeLinejoin="round" strokeLinecap="round">
      {/* bunting */}
      <path d="M4 14 Q140 34 276 14" stroke={INK} strokeWidth="2" />
      {flags.map((c, i) => {
        const x = 20 + i * 37;
        const y = 17 + 9 * Math.sin((x / 280) * Math.PI);
        return <path key={i} transform={`translate(${x} ${y})`} d="M0 0H22L11 20Z" fill={c} stroke={INK} strokeWidth="2" />;
      })}
      {/* ground */}
      <ellipse cx="140" cy="158" rx="126" ry="10" fill={TEAL} opacity="0.22" />
      {/* house */}
      <path d="M72 94H208V152H72Z" fill={CREAM} stroke={INK} strokeWidth="3" />
      <path d="M58 98 140 40 222 98Z" fill={PINK} stroke={INK} strokeWidth="3" />
      <path d="M176 62V44h16v32" fill={TEAL} stroke={INK} strokeWidth="3" />
      <path d="M140 74c-9-5-12-9-12-13 0-3 2-5 5-5 3 0 5 2 7 5 2-3 4-5 7-5 3 0 5 2 5 5 0 4-3 8-12 13Z" fill={SUN} stroke={INK} strokeWidth="2.5" />
      {/* door + windows */}
      <path d="M124 152V116a16 16 0 0 1 32 0v36Z" fill={TEAL} stroke={INK} strokeWidth="3" />
      <circle cx="150" cy="134" r="2.5" fill={SUN} />
      <rect x="84" y="108" width="28" height="28" rx="3" fill={SUN} stroke={INK} strokeWidth="3" />
      <path d="M98 108v28M84 122h28" stroke={INK} strokeWidth="2" />
      <rect x="168" y="108" width="28" height="28" rx="3" fill={SUN} stroke={INK} strokeWidth="3" />
      <path d="M182 108v28M168 122h28" stroke={INK} strokeWidth="2" />
      {/* the family */}
      <g stroke={INK} strokeWidth="2.5">
        <circle cx="232" cy="122" r="7" fill={SUN} />
        <path d="M222 152v-14a10 10 0 0 1 20 0v14Z" fill={PINK} />
        <circle cx="254" cy="132" r="6" fill={SUN} />
        <path d="M246 152v-10a8 8 0 0 1 16 0v10Z" fill={TEAL} />
        <circle cx="213" cy="140" r="5" fill={SUN} />
        <path d="M207 152v-6a6 6 0 0 1 12 0v6Z" fill={INK} />
      </g>
      {/* marigolds */}
      <g stroke={INK} strokeWidth="2">
        <circle cx="38" cy="144" r="8" fill={MARIGOLD} />
        <circle cx="38" cy="144" r="3" fill={PINK} />
        <circle cx="56" cy="150" r="6" fill={SUN} />
        <circle cx="56" cy="150" r="2.2" fill={PINK} />
      </g>
    </svg>
  );
}

const PEOPLE_COLORS = [PINK, TEAL, INK, MARIGOLD, PINK, TEAL, INK, MARIGOLD, PINK, TEAL] as const;

/** One little person; the stepper shows as many as live in the home. */
export function Person({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 28 38" className="h-9 w-7 shrink-0" aria-hidden="true" strokeLinejoin="round">
      <circle cx="14" cy="9" r="6.5" fill={SUN} stroke={INK} strokeWidth="2" />
      <path d="M3 36v-8a11 11 0 0 1 22 0v8Z" fill={PEOPLE_COLORS[index % PEOPLE_COLORS.length]} stroke={INK} strokeWidth="2" />
    </svg>
  );
}
