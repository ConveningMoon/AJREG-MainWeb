import { Play } from "lucide-react";
import type { TeamMember } from "@/data/team";

type Props = {
  member: TeamMember;
  label: string;
};

export function AgentVideoSection({ member, label }: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-linear-to-br from-navy-800 to-slate shadow-lg">
      {/* Placeholder thumbnail — swap for real video or thumbnail image when available */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <button
          type="button"
          aria-label={label}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-navy-950 shadow-xl transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true" />
        </button>
        <span className="font-display text-lg text-cream/80">
          {member.name}
        </span>
      </div>
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff7f5 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
