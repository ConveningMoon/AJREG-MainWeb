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
    <section className="bg-blush/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-700">
            {t("intro")}
          </p>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2">
          {salesStories.map((story) => (
            <article
              key={story.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5"
            >
              {/* Placeholder media panel */}
              <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-navy-800 to-slate">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-cream/90 text-navy shadow-lg"
                  aria-hidden="true"
                >
                  <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                </span>
                <span className="absolute bottom-3 left-4 font-display text-lg font-semibold text-cream">
                  {t("familyLabel", { name: story.family })}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="flex-1 text-sm leading-relaxed text-navy-700">
                  “{story.quote}”
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
