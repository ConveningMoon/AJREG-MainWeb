"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NewsletterSubscribeForm } from "@/components/forms/NewsletterSubscribeForm";

export function NewsletterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("newsletter");
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape and lock body scroll while open; focus the close button.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
    >
      {/* Backdrop */}
      <button
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-navy-950/70 backdrop-blur-sm motion-safe:animate-[fadeIn_200ms_ease-out]"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-cream shadow-2xl ring-1 ring-navy-900/10 motion-safe:animate-[popIn_220ms_cubic-bezier(0.16,1,0.3,1)]">
        <div className="h-1.5 w-full bg-gold" />
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-3 top-3 rounded-full p-1.5 text-navy-500 transition-colors hover:bg-navy-900/5 hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-7 pb-7 pt-8">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {t("eyebrow")}
          </p>
          <h2
            id="newsletter-title"
            className="mt-2 font-display text-2xl font-semibold leading-tight text-navy"
          >
            {t("title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-700">
            {t("subtitle")}
          </p>

          <div className="mt-6">
            <NewsletterSubscribeForm />
          </div>

          <Link
            href="/newsletter"
            onClick={onClose}
            className="mt-5 inline-block text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold"
          >
            {t("seeArchive")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
