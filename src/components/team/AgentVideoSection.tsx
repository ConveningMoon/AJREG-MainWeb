import { Play } from "lucide-react";
import type { TeamMember } from "@/data/team";

type Props = {
  member: TeamMember;
  label: string;
  large?: boolean;
};

export function AgentVideoSection({ member, label, large = false }: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-sm bg-linear-to-br from-navy-800 to-slate shadow-xl ${large ? "aspect-video" : "aspect-video"}`}
    >
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff7f5 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />

      {/* Play button + label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <button
          type="button"
          aria-label={label}
          className={`flex items-center justify-center rounded-full bg-gold text-navy-950 shadow-2xl transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${large ? "h-20 w-20" : "h-14 w-14"}`}
        >
          <Play
            className={`ml-1 ${large ? "h-9 w-9" : "h-6 w-6"}`}
            fill="currentColor"
            aria-hidden="true"
          />
        </button>
        <span className={`font-display text-cream/70 ${large ? "text-xl" : "text-base"}`}>
          {member.name}
        </span>
      </div>
    </div>
  );
}
