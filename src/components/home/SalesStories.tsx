import { getTranslations } from "next-intl/server";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { salesStories } from "@/data/salesStories";

// NOTE: real video thumbnails for these stories aren't available yet, so each
// card uses a branded placeholder media panel. Swap in <Image> once provided.
export async function SalesStories() {
  const t = await getTranslations("home.salesStories");

  return (
    <section className="bg-taupe/15 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-700">
            {t("intro")}
          </p>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          {salesStories.map((story, i) => (
            <article
              key={story.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5"
            >
              {/* Placeholder media panel */}
              <div
                className={`relative flex items-center justify-center bg-gradient-to-br from-navy-800 to-slate ${
                  i === 0 ? "aspect-[4/5]" : "aspect-[16/9]"
                }`}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy-950"
                  aria-hidden="true"
                >
                  <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                </span>
                <span className="absolute bottom-3 left-4 font-display text-xl text-cream">
                  {t("familyLabel", { name: story.family })}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="flex-1 text-sm leading-relaxed text-navy-700">
                  "{story.quote}"
                </p>
                <Link
                  href="/houses"
                  className="group mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-navy transition-colors hover:text-gold"
                >
                  {t("cta")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
