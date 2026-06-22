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
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-navy-900 to-navy-800 p-8 text-cream shadow-lg">
      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #c7a260 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/20">
            <Gift className="h-6 w-6 text-gold" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold">{titleText}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-200">
              {descriptionText}
            </p>
          </div>
        </div>
        <Link
          href={`/resources/${resource.slug}`}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          {ctaText}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
