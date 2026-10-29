// Hollow glass envelopes surround fine incandescent filaments, rather than LEDs.
const glyphs: Record<string, string> = {
  "0": "M36 15 C14 15 13 35 13 62 S14 109 36 109 S59 89 59 62 S58 15 36 15 Z",
  "1": "M16 34 Q30 28 39 15 L39 108 M17 108 H61",
  "2": "M14 30 C17 9 59 9 59 34 C59 55 17 72 14 108 H60",
  "3": "M15 20 C49 5 72 32 42 58 C76 72 57 124 14 104 M29 58 H42",
  "4": "M51 110 V15 L12 78 H65",
  "5": "M59 15 H17 V56 C72 38 73 123 15 106",
  "6": "M56 17 C14 1 10 51 13 79 C16 123 66 120 61 80 C57 47 14 47 13 79",
  "7": "M12 15 H62 L26 109",
  "8": "M36 58 C-1 42 13 7 36 15 C66 5 74 43 36 58 C-5 74 8 119 36 109 C67 122 79 74 36 58 Z",
  "9": "M15 107 C60 123 66 72 61 44 C57 1 8 5 13 44 C17 78 58 78 61 44",
  "/": "M57 10 L17 114",
};

const filaments: Record<string, string> = {
  "0": "M24 28 Q13 62 24 97 M48 28 Q59 62 48 97 M25 25 Q36 16 47 25 M25 100 Q36 109 47 100",
  "1": "M35 29 Q29 65 35 100 M43 29 Q49 65 43 100 M24 105 H54",
  "/": "M49 22 L22 103 M53 23 L26 104",
};

export function OccupancyLights({ occupied, capacity, label }: { occupied: number; capacity: number; label: string }) {
  const text = `${occupied}/${capacity}`;
  const ratio = Math.min(1, Math.max(0, occupied / capacity));
  const color = `hsl(${120 * (1 - ratio)} 75% 62%)`;
  return (
    <svg className="gala-rsvp-occupancy-lights" viewBox={`0 0 ${text.length * 84 + 8} 140`} role="img" aria-label={label} style={{ color }}>
      <defs>
        <linearGradient id="gala-glass-rim" x1="0" y1="0" x2="1" y2=".35">
          <stop offset="0" stopColor="white" stopOpacity=".1" />
          <stop offset=".08" stopColor="white" stopOpacity=".9" />
          <stop offset=".15" stopColor="white" stopOpacity=".18" />
          <stop offset=".38" stopColor="white" stopOpacity=".05" />
          <stop offset=".62" stopColor="white" stopOpacity=".15" />
          <stop offset=".83" stopColor="white" stopOpacity=".85" />
          <stop offset=".91" stopColor="white" stopOpacity=".1" />
          <stop offset="1" stopColor="white" stopOpacity=".65" />
        </linearGradient>
        <linearGradient id="gala-glass-body" x1="0" y1="0" x2="1" y2=".15">
          <stop offset="0" stopColor="white" stopOpacity=".3" />
          <stop offset=".18" stopColor="currentColor" stopOpacity=".32" />
          <stop offset=".45" stopColor="white" stopOpacity=".09" />
          <stop offset=".7" stopColor="currentColor" stopOpacity=".25" />
          <stop offset="1" stopColor="white" stopOpacity=".25" />
        </linearGradient>
        <linearGradient id="gala-glass-reflection" x1="0" y1="0" x2=".4" y2="1">
          <stop offset="0" stopColor="white" stopOpacity=".95" />
          <stop offset=".28" stopColor="white" stopOpacity=".05" />
          <stop offset=".48" stopColor="white" stopOpacity=".6" />
          <stop offset=".65" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity=".7" />
        </linearGradient>
        <filter id="gala-filament-glow" x="-60%" y="-40%" width="220%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id="gala-glass-halo" x="-80%" y="-50%" width="260%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {Array.from(text, (character, digit) => (
        <g key={digit} transform={`translate(${digit * 84 + 6} 8)`} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {/* Clear thick glass, dark interior and double refracted edges. */}
          <path d={glyphs[character]} stroke="black" strokeOpacity=".45" strokeWidth="25" transform="translate(1 3)" />
          <path d={glyphs[character]} stroke="currentColor" strokeOpacity=".45" strokeWidth="24" filter="url(#gala-glass-halo)" />
          <path d={glyphs[character]} stroke="url(#gala-glass-rim)" strokeWidth="23" />
          <path d={glyphs[character]} stroke="var(--color-navy-950)" strokeOpacity=".65" strokeWidth="19" />
          <path d={glyphs[character]} stroke="url(#gala-glass-body)" strokeWidth="17" />
          <path d={glyphs[character]} stroke="url(#gala-glass-reflection)" strokeWidth="1.3" transform="translate(-8 -2)" strokeDasharray="23 16 7 40" />
          <path d={glyphs[character]} stroke="white" strokeOpacity=".22" strokeWidth=".7" transform="translate(7 1)" />
          {/* Fine wires glow inside the glass; gaps expose support connections. */}
          <path d={filaments[character] ?? glyphs[character]} stroke="currentColor" strokeWidth="11" filter="url(#gala-filament-glow)" />
          <path d={filaments[character] ?? glyphs[character]} stroke="currentColor" strokeWidth="3.2" />
          <path d={filaments[character] ?? glyphs[character]} stroke="white" strokeWidth="1.4" />
          {character !== "/" && <g stroke="currentColor" strokeOpacity=".6" strokeWidth=".6">
            <ellipse cx="37" cy="103" rx="6" ry="2" />
            <ellipse cx="37" cy="106" rx="6" ry="2" />
            <path d="M33 96 V112 M41 96 V112" />
          </g>}
        </g>
      ))}
    </svg>
  );
}
