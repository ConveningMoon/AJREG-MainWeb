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
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${styles.option} min-h-12 justify-center text-center text-[15px] ${selected ? styles.optionOn : ""}`}
    >
      {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={3.5} aria-hidden="true" />}
      <span>{children}</span>
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-navy-900">
        {label}
      </label>
      {children}
      {help && !error && <p className="mt-1 text-xs font-medium text-navy-700">{help}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-bold text-[#a50f4c]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
