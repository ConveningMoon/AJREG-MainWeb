import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getResourceBySlug, agentResources } from "@/data/resources";
import { seedTeam } from "@/data/team";
import { routing } from "@/i18n/routing";
import { ResourceForm } from "./ResourceForm";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    agentResources.map((r) => ({ locale, slug: r.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return {};
  const t = await getTranslations({ locale, namespace: "resources" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const title = t(`${resource.agentSlug.split("-")[0]}.title` as any);
  return { title, description: t("cta") };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const resource = getResourceBySlug(slug);
  if (!resource) notFound();

  const agent = seedTeam.find((m) => m.slug === resource.agentSlug);
  if (!agent) notFound();

  const t  = await getTranslations({ locale, namespace: "resources" });
  const key = agent.slug.split("-")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const titleText       = t(`${key}.title` as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const descriptionText = t(`${key}.description` as any);

  // Build question + option label maps for the client form
  const questionLabels: Record<string, string> = {};
  const optionLabels:   Record<string, Record<string, string>> = {};

  for (const q of resource.questions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questionLabels[q.key] = t(`questions.${key}.${q.key}` as any);
    optionLabels[q.key] = {};
    for (const opt of q.options ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      optionLabels[q.key][opt] = t(`questions.${key}.${q.key}Options.${opt}` as any);
    }
  }

  const labels = {
    steps:        { info: t("steps.info"), questions: t("steps.questions"), confirm: t("steps.confirm") },
    fields:       { firstName: t("fields.firstName"), lastName: t("fields.lastName"), email: t("fields.email"), phone: t("fields.phone"), optional: t("fields.optional") },
    submit:       t("submit"),
    submitting:   t("submitting"),
    successTitle: t("successTitle"),
    successBody:  t("successBody"),
    errorTitle:   t("errorTitle"),
    errorBody:    t("errorBody"),
    questionLabels,
    optionLabels,
  };

  return (
    <main className="flex flex-1 flex-col bg-cream">
      {/* Header band */}
      <div className="bg-navy-900 py-12 text-cream">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href={`/team/${agent.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-300 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {agent.name}
          </Link>
          <div className="mt-5 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/20">
              <Gift className="h-6 w-6 text-gold" aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                Free Resource — {agent.name}
              </span>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {titleText}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-navy-200">
                {descriptionText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
          <ResourceForm resource={resource} labels={labels} locale={locale} />
        </div>
      </div>
    </main>
  );
}
