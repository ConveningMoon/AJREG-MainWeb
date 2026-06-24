"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ label }: { label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // user cancelled or API unsupported — fall through to clipboard
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-navy-600 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
    >
      {copied ? (
        <Check className="h-4 w-4 text-gold" aria-hidden="true" />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
