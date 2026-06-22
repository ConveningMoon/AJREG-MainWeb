// Small section label used across the home sections (a consistent signature):
// a short gold rule followed by an uppercase, wide-tracked label.
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold ${className}`}
    >
      <span className="h-0.5 w-12 bg-gold" aria-hidden="true" />
      {children}
    </span>
  );
}
