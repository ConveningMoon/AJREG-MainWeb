// Authored evergreen branch, shared by the countdown and video wreath.
// Decorative only: event facts and controls never depend on this artwork.
export function HolidaySprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 108 Q72 56 147 17" />
        {[30, 50, 70, 90, 110, 130].map((x, i) => {
          const y = 95 - i * 13;
          return <path key={x} d={`M${x} ${y} l-5 -27 M${x} ${y} l26 5 M${x + 4} ${y - 3} l4 -25 M${x + 4} ${y - 3} l26 -3`} />;
        })}
      </g>
      <g fill="var(--color-gold)">
        <circle cx="42" cy="80" r="4" /><circle cx="103" cy="54" r="3" /><circle cx="121" cy="32" r="4" />
      </g>
      <path d="M60 66v24" stroke="var(--color-gold)" strokeWidth="1" />
      <circle cx="60" cy="99" r="11" fill="var(--gala-wine)" stroke="var(--color-gold)" />
      <path d="M56 91q-5 7 0 14" fill="none" stroke="var(--color-gold)" strokeOpacity=".65" />
    </svg>
  );
}
