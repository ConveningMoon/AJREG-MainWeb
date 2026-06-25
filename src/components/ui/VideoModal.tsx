"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { youtubeEmbedUrl } from "@/lib/youtube";

type Props = {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export function VideoModal({ videoId, isOpen, onClose, title }: Props) {
  const t = useTranslations("common");

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? t("closeVideo")}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("closeVideo")}
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-sm bg-black shadow-2xl">
          <iframe
            src={youtubeEmbedUrl(videoId)}
            title={title ?? "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
