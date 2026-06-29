"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { extractYouTubeId, youtubeThumbnail } from "@/lib/youtube";
import { VideoModal } from "@/components/ui/VideoModal";

type Props = {
  videoUrl?: string;
  name: string;
  label: string;
  large?: boolean;
};

export function AgentVideoSection({ videoUrl, name, label, large = false }: Props) {
  const [open, setOpen] = useState(false);
  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative aspect-video w-full overflow-hidden rounded-sm bg-linear-to-br from-navy-800 to-slate shadow-xl"
      >
        {/* YouTube thumbnail */}
        {videoId && (
          <Image
            src={youtubeThumbnail(videoId)}
            alt={label}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            priority
          />
        )}

        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff7f5 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 bg-linear-to-t from-navy-950/70 via-navy-950/20 to-transparent ${!videoId ? "opacity-0" : ""}`}
          aria-hidden="true"
        />

        {/* Play button + name */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.button
            type="button"
            onClick={videoId ? () => setOpen(true) : undefined}
            aria-label={label}
            aria-disabled={!videoId || undefined}
            whileHover={videoId ? { scale: 1.1 } : undefined}
            whileTap={videoId ? { scale: 0.96 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`flex items-center justify-center rounded-full bg-gold text-navy-950 shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${large ? "h-20 w-20" : "h-14 w-14"} ${!videoId ? "cursor-default opacity-60" : "cursor-pointer"}`}
          >
            <Play
              className={`ml-1 ${large ? "h-9 w-9" : "h-6 w-6"}`}
              fill="currentColor"
              aria-hidden="true"
            />
          </motion.button>
          <span
            className={`font-display text-cream/70 drop-shadow-sm ${large ? "text-xl" : "text-base"}`}
          >
            {name}
          </span>
        </div>
      </motion.div>

      {videoId && (
        <VideoModal
          videoId={videoId}
          isOpen={open}
          onClose={() => setOpen(false)}
          title={label}
        />
      )}
    </>
  );
}
