import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowLeft, Bed, Bath, Maximize2, Calendar, Car, Landmark, Phone, Check, Download,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getListing, getListings } from "@/lib/listings";
import { PropertyGallery } from "@/components/houses/PropertyGallery";
import { FloorPlanCarousel } from "@/components/houses/FloorPlanCarousel";
import { ShareButton } from "@/components/houses/ShareButton";
import { brand } from "@/lib/brand";
import { routing } from "@/i18n/routing";
import { seedListings } from "@/data/listings";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export async function generateStaticParams() {
  const listings = seedListings;
  return routing.locales.flatMap((locale) =>
    listings.map((l) => ({ locale, id: l.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const listing = await getListing(id);
  if (!listing) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = `${listing.name} — ${priceFmt.format(listing.priceUsd)}`;
  return {
    title,
    description: `${listing.bedrooms} bd · ${listing.sqft.toLocaleString()} sq ft · ${listing.address}, ${listing.city}, ${listing.state}. ${t("siteName")}`,
    openGraph: { title, images: listing.imageUrl ? [listing.imageUrl] : [] },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [listing, allListings] = await Promise.all([
    getListing(id),
    getListings(),
  ]);

  if (!listing) notFound();

  const t  = await getTranslations({ locale, namespace: "houses" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const isEs = locale === "es";
  const description = isEs
    ? (listing.descriptionEs ?? listing.descriptionEn ?? listing.description)
    : (listing.descriptionEn ?? listing.description);
  const features = isEs
    ? ((listing.featuresEs?.length ? listing.featuresEs : null) ?? listing.featuresEn ?? listing.features)
    : (listing.featuresEn ?? listing.features);

  const baths = listing.bathroomsFull + (listing.bathroomsHalf > 0 ? 0.5 : 0);
  const bathsLabel = Number.isInteger(baths) ? String(baths) : baths.toFixed(1);

  const gallery = listing.gallery?.length
    ? [listing.imageUrl, ...listing.gallery].filter(Boolean) as string[]
    : listing.imageUrl
    ? [listing.imageUrl]
    : [];

  const related = allListings.filter((l) => l.id !== listing.id).slice(0, 3);

  const statusKey = listing.status ?? "available";
  const statusColors: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-800",
    pending:   "bg-amber-100 text-amber-800",
    sold:      "bg-navy-100 text-navy-700",
  };

  /* Quick-spec items (only defined when the value is present) */
  const specs = [
    { Icon: Bed,       value: listing.bedrooms,                      label: t("detail.beds",   { count: listing.bedrooms }) },
    { Icon: Bath,      value: bathsLabel,                            label: t("detail.baths",  { count: bathsLabel }) },
    { Icon: Maximize2, value: listing.sqft.toLocaleString("en-US"),  label: t("detail.sqft",   { count: listing.sqft.toLocaleString("en-US") }) },
    ...(listing.yearBuilt ? [{ Icon: Calendar, value: listing.yearBuilt, label: `${t("detail.yearBuilt")}: ${listing.yearBuilt}` }] : []),
    ...((listing.garageSpaces ?? 0) > 0 ? [{ Icon: Car,      value: listing.garageSpaces!, label: t("detail.garage", { count: listing.garageSpaces! }) }] : []),
    ...(listing.lotSqft ? [{ Icon: Landmark,  value: listing.lotSqft,  label: t("detail.lot", { count: listing.lotSqft.toLocaleString("en-US") }) }] : []),
  ];

  return (
    <main className="flex flex-1 flex-col bg-cream">
      {/* Breadcrumb */}
      <div className="border-b border-navy-100 bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/houses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("detail.backToListings")}
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-12">

        {/* Header — name + price + download */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColors[statusKey]}`}>
                {t(`detail.${statusKey}` as "detail.available")}
              </span>
              {listing.propertyType && (
                <span className="text-sm text-navy-500">{listing.propertyType}</span>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl lg:text-5xl">
              {listing.neighborhood ?? listing.name}
            </h1>
            <p className="mt-1 text-navy-600">{listing.address}, {listing.city}, {listing.state}</p>
          </div>
          <div className="self-center">
            <p className="font-display text-4xl font-semibold text-gold lg:text-5xl">
              {priceFmt.format(listing.priceUsd)}
            </p>
          </div>
        </div>

        {/* Gallery — 4-col 2-row grid */}
        <PropertyGallery
          images={gallery}
          name={listing.name}
          imageAltPattern={t("detail.imageAlt")}
        />

        {/* Specs bar — centered columns */}
        <div className="mt-6 rounded-xl bg-white shadow-sm ring-1 ring-navy-900/5">
          <div className="flex flex-wrap items-stretch justify-center divide-y divide-navy-100 sm:divide-x sm:divide-y-0">
            {specs.map((s, i) => (
              <div
                key={i}
                className="flex min-w-[120px] flex-col items-center gap-1.5 px-6 py-5 text-center"
              >
                <s.Icon className="h-6 w-6 text-gold" aria-hidden="true" />
                <span className="mt-0.5 text-sm font-medium text-navy-700">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* Left: description + features + floor plan */}
          <div className="space-y-6">
            {description && (
              <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
                <h2 className="font-display text-2xl font-semibold text-navy">
                  {t("detail.descriptionTitle")}
                </h2>
                <p className="mt-4 leading-relaxed text-navy-700">{description}</p>
                <div className="mt-6 border-t border-navy-100 pt-5">
                  {listing.detailPdfUrl ? (
                    <a
                      href={listing.detailPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2.5 rounded-xl border border-navy-200 bg-cream px-5 py-2.5 text-sm font-semibold text-navy-700 shadow-sm transition-all hover:border-gold hover:bg-gold/8 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      {t("detail.download")}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2.5 rounded-xl border border-navy-100 bg-navy-50 px-5 py-2.5 text-sm font-medium text-navy-400 cursor-not-allowed select-none">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      {t("detail.downloadNotAvailable")}
                    </span>
                  )}
                </div>
              </section>
            )}

            {features && features.length > 0 && (
              <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
                <h2 className="font-display text-2xl font-semibold text-navy">
                  {t("detail.featuresTitle")}
                </h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-navy-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Floor plan carousel */}
            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
              <h2 className="font-display text-2xl font-semibold text-navy">
                {t("detail.floorPlanTitle")}
              </h2>
              <FloorPlanCarousel
                images={listing.floorPlans ?? []}
                name={listing.name}
                altPattern={t("detail.floorPlanAlt")}
                placeholder={t("detail.floorPlanPlaceholder")}
              />
            </section>
          </div>

          {/* Sidebar: CTA */}
          <aside>
            <div className="sticky top-24 rounded-xl bg-navy-900 p-6 text-cream shadow-lg">
              <h2 className="font-display text-xl font-semibold">{t("detail.ctaTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-200">
                {t("detail.ctaSubtitle")}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center rounded-sm bg-gold px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85"
                >
                  {t("detail.ctaButton")}
                </Link>
                <a
                  href={brand.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {tc("callUs")}
                </a>
                <a
                  href={brand.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  {t("detail.whatsappButton")}
                </a>

                {/* Share — replaces address/price recap */}
                <div className="border-t border-navy-700 pt-4">
                  <ShareButton label={t("detail.share")} />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related properties */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold text-navy">
              {t("detail.relatedTitle")}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/houses/${r.id}`}
                  className="group flex flex-col overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-navy-800 to-slate">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Bed className="h-10 w-10 text-cream/20" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-xl font-semibold text-navy">{priceFmt.format(r.priceUsd)}</p>
                    <p className="mt-0.5 text-sm font-medium text-navy">{r.name}</p>
                    <p className="mt-0.5 text-xs text-navy-500">{r.address}, {r.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
