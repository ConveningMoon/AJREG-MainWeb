import { Check } from "lucide-react";
import styles from "./Hogar.module.css";

export function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.sticky}>
      <div className="mx-auto w-full max-w-lg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}

export function OptionButton({
  selected,
  onClick,
  children,
  compact,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${styles.option} ${compact ? "min-h-12 justify-center text-center text-[15px]" : "min-h-14 text-left"} ${
        selected ? styles.optionOn : ""
      }`}
    >
      <span className="flex-1">{children}</span>
      {!compact && selected && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}

export function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {help && !error && <p className="mt-1 text-xs text-navy-500">{help}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-[#8a3b2c]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
