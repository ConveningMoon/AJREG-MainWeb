"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// EN/ES toggle that preserves the current route. usePathname() returns the
// concrete, already-resolved path (locale stripped), so passing it back with a
// new locale keeps dynamic segments intact.
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: string) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="group"
      aria-label="Language"
    >
      <Globe className="mr-1 h-4 w-4 text-navy-300" aria-hidden="true" />
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1 text-navy-500">/</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            aria-current={l === locale ? "true" : undefined}
            className={`text-sm font-semibold uppercase transition-colors ${
              l === locale
                ? "text-gold"
                : "text-navy-200 hover:text-cream"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
