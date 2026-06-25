"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { TeamMember } from "@/data/team";
import { extractYouTubeId, youtubeThumbnail } from "@/lib/youtube";
import { VideoModal } from "@/components/ui/VideoModal";

type Props = {
  member: TeamMember;
  label: string;
  large?: boolean;
};

export function AgentVideoSection({ member, label, large = false }: Props) {
  const [open, setOpen] = useState(false);
  const videoId = member.videoUrl ? extractYouTubeId(member.videoUrl) : null;

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-sm bg-linear-to-br from-navy-800 to-slate shadow-xl aspect-video"
      >
        {/* Real YouTube thumbnail when URL is set */}
        {videoId && (
          <Image
            src={youtubeThumbnail(videoId)}
            alt={label}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
          />
        )}

        {/* Subtle dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff7f5 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        {/* Gradient overlay (more pronounced over thumbnail) */}
        <div
          className={`absolute inset-0 bg-linear-to-t from-navy-950/70 via-navy-950/20 to-transparent ${!videoId ? "opacity-0" : ""}`}
          aria-hidden="true"
        />

        {/* Play button + member name */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            onClick={videoId ? () => setOpen(true) : undefined}
            aria-label={label}
            aria-disabled={!videoId || undefined}
            className={`flex items-center justify-center rounded-full bg-gold text-navy-950 shadow-2xl transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${large ? "h-20 w-20" : "h-14 w-14"} ${!videoId ? "opacity-60 cursor-default" : "cursor-pointer"}`}
          >
            <Play
              className={`ml-1 ${large ? "h-9 w-9" : "h-6 w-6"}`}
              fill="currentColor"
              aria-hidden="true"
            />
          </button>
          <span className={`font-display text-cream/70 drop-shadow-sm ${large ? "text-xl" : "text-base"}`}>
            {member.name}
          </span>
        </div>
      </div>

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
