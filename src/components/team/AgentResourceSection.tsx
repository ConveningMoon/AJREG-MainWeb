import { ArrowRight, Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AgentResource } from "@/data/resources";

type Props = {
  resource: AgentResource;
  titleText: string;
  descriptionText: string;
  ctaText: string;
};

export function AgentResourceSection({
  resource,
  titleText,
  descriptionText,
  ctaText,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-sm bg-linear-to-br from-navy-900 to-navy-800 text-cream shadow-lg">
      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #c7a260 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-0 sm:grid-cols-[1fr_200px]">
        {/* Content */}
        <div className="flex flex-col justify-center p-8 lg:p-10">
          <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/20">
            <Gift className="h-5 w-5 text-gold" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold sm:text-3xl">
            {titleText}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-navy-200">
            {descriptionText}
          </p>
          <div className="mt-6">
            <Link
              href={`/resources/${resource.slug}`}
              className="group inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {ctaText}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Guide mockup placeholder */}
        <div className="hidden items-center justify-center bg-navy-950/30 p-8 sm:flex">
          <div className="relative flex h-[200px] w-[140px] flex-col items-center justify-between overflow-hidden rounded-sm bg-navy-800 py-6 shadow-xl ring-1 ring-white/10">
            {/* Spine accent */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gold/60" />
            {/* Content */}
            <div className="flex flex-col items-center gap-3 px-4 text-center">
              <span className="block h-0.5 w-10 bg-gold/60" />
              <span className="font-display text-3xl font-semibold text-gold/50">A&J</span>
              <span className="block h-px w-6 bg-cream/10" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cream/30">
                Free Guide
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-4 text-center">
              <span className="block h-px w-8 bg-cream/10" />
              <span className="text-[8px] font-medium uppercase tracking-widest text-cream/20">
                A&J Real Estate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
