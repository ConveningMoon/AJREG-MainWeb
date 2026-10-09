// Simple Equal Housing Opportunity glyph (house with an equals sign), drawn in
// currentColor. Not the official HUD artwork — swap for the licensed asset if
// the brokerage supplies one.
export function EqualHousingMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" role="img" aria-label="Equal Housing Opportunity">
      <path d="M3 15 16 4l13 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 13.500V28h20V13.500" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 17.500h10M11 22.500h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
