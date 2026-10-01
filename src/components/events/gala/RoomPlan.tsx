// Top-down sketch of a ballroom ringed by screens, one of them carrying the
// sponsor's video. Illustrative only — not the venue's real floor plan — and
// labeled as such on the page.

const screens = [
  { x: 90, y: 14, w: 120, h: 9 },
  { x: 250, y: 14, w: 120, h: 9, yours: true },
  { x: 410, y: 14, w: 120, h: 9 },
  { x: 14, y: 110, w: 9, h: 120 },
  { x: 597, y: 110, w: 9, h: 120 },
  { x: 150, y: 317, w: 120, h: 9 },
  { x: 350, y: 317, w: 120, h: 9 },
];

const guestTables = [
  [150, 120], [235, 105], [320, 120], [405, 105], [490, 120],
  [190, 190], [275, 205], [360, 190], [445, 205],
];

export function RoomPlan({
  labels,
}: {
  labels: { yours: string; screens: string; vendors: string; guests: string; note: string };
}) {
  return (
    <figure>
      <svg viewBox="0 0 620 340" className="h-auto w-full" role="img" aria-label={labels.note}>
        <rect x="6" y="6" width="608" height="328" rx="18" fill="#0a1321" stroke="#344a5d" />
        {/* Light cast by the sponsor's screen */}
        <path d="M250 23 L370 23 L430 150 L190 150 Z" fill="#c7a260" opacity="0.08" />
        {screens.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx="2"
            fill={s.yours ? "#c7a260" : "#597383"}
          />
        ))}
        {guestTables.map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="20" fill="#22354a" />
            <circle cx={cx} cy={cy} r="27" fill="none" stroke="#344a5d" strokeDasharray="2 5" />
          </g>
        ))}
        {/* Vendor tables along the lower wall */}
        {[60, 150, 240, 330, 420, 510].map((x) => (
          <rect key={x} x={x} y="262" width="56" height="22" rx="3" fill="none" stroke="#c7a260" strokeOpacity="0.55" />
        ))}
      </svg>
      <figcaption className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-100">
        <span className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-sm bg-gold" aria-hidden="true" />
          {labels.yours}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-sm bg-navy-500" aria-hidden="true" />
          {labels.screens}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm border border-gold/55" aria-hidden="true" />
          {labels.vendors}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-navy-800" aria-hidden="true" />
          {labels.guests}
        </span>
        <span className="w-full text-xs text-navy-300">{labels.note}</span>
      </figcaption>
    </figure>
  );
}
