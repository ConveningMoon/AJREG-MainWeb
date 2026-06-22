import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Bed, Bath, Maximize2, Calendar, Car, Landmark, Phone, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getListing, getListings } from "@/lib/listings";
import { PropertyGallery } from "@/components/houses/PropertyGallery";
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

  const t = await getTranslations({ locale, namespace: "houses" });
  const tc = await getTranslations({ locale, namespace: "common" });

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

  return (
    <main className="flex flex-1 flex-col bg-cream">
      {/* Top breadcrumb */}
      <div className="bg-cream border-b border-navy-100">
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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColors[statusKey]}`}>
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
          <p className="font-display text-4xl font-semibold text-gold lg:text-5xl">
            {priceFmt.format(listing.priceUsd)}
          </p>
        </div>

        {/* Gallery */}
        <PropertyGallery
          images={gallery}
          name={listing.name}
          imageAltPattern={t("detail.imageAlt")}
        />

        {/* Quick specs bar */}
        <div className="mt-6 flex flex-wrap gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
            <Bed className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.beds", { count: listing.bedrooms })}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
            <Bath className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.baths", { count: bathsLabel })}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
            <Maximize2 className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.sqft", { count: listing.sqft.toLocaleString("en-US") })}
          </span>
          {listing.yearBuilt && (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
              <Calendar className="h-5 w-5 text-gold" aria-hidden="true" />
              {t("detail.yearBuilt")}: {listing.yearBuilt}
            </span>
          )}
          {listing.garageSpaces != null && listing.garageSpaces > 0 && (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
              <Car className="h-5 w-5 text-gold" aria-hidden="true" />
              {t("detail.garage", { count: listing.garageSpaces })}
            </span>
          )}
          {listing.lotSqft && (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
              <Landmark className="h-5 w-5 text-gold" aria-hidden="true" />
              {t("detail.lot", { count: listing.lotSqft.toLocaleString("en-US") })}
            </span>
          )}
        </div>

        {/* Content grid: main + sidebar */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left: description + features + floor plan */}
          <div className="space-y-8">
            {listing.description && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
                <h2 className="font-display text-2xl font-semibold text-navy">
                  {t("detail.descriptionTitle")}
                </h2>
                <p className="mt-4 leading-relaxed text-navy-700">{listing.description}</p>
              </section>
            )}

            {listing.features && listing.features.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
                <h2 className="font-display text-2xl font-semibold text-navy">
                  {t("detail.featuresTitle")}
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {listing.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-navy-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Floor plan */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
              <h2 className="font-display text-2xl font-semibold text-navy">
                {t("detail.floorPlanTitle")}
              </h2>
              {listing.floorPlanUrl ? (
                <img
                  src={listing.floorPlanUrl}
                  alt={`${listing.name} floor plan`}
                  className="mt-4 w-full cursor-zoom-in rounded-xl"
                />
              ) : (
                <div className="mt-4 flex h-40 items-center justify-center rounded-2xl bg-blush/40 text-sm text-navy-500">
                  {t("detail.floorPlanPlaceholder")}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: CTA */}
          <aside className="space-y-4">
            <div className="sticky top-24 rounded-2xl bg-navy-900 p-6 text-cream shadow-lg">
              <h2 className="font-display text-xl font-semibold">{t("detail.ctaTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-200">
                {t("detail.ctaSubtitle")}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href={`/contact-us`}
                  className="inline-flex items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85"
                >
                  {t("detail.ctaButton")}
                </Link>
                <a
                  href={brand.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-600 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {tc("callUs")}
                </a>
                <a
                  href={brand.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-600 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  {t("detail.whatsappButton")}
                </a>
              </div>
              {/* Key facts recap */}
              <div className="mt-6 border-t border-navy-700 pt-5 text-sm text-navy-300 space-y-2">
                <p>{listing.address}, {listing.city}, {listing.state}</p>
                <p className="font-semibold text-gold">{priceFmt.format(listing.priceUsd)}</p>
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
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-lg"
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
