import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Bath, BedDouble, Home, MapPin, Maximize } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Listing } from "@/data/listings";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export async function PropertyCard({ listing }: { listing: Listing }) {
  const t = await getTranslations("houses.card");
  const baths = listing.bathroomsFull + (listing.bathroomsHalf > 0 ? 0.5 : 0);
  const bathsLabel = Number.isInteger(baths) ? String(baths) : baths.toFixed(1);

  const specs = [
    { Icon: BedDouble, text: t("beds", { count: listing.bedrooms }) },
    { Icon: Bath, text: t("baths", { count: bathsLabel }) },
    {
      Icon: Maximize,
      text: t("sqft", { count: listing.sqft.toLocaleString("en-US") }),
    },
  ];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-lg">
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-navy-800 to-slate">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Home className="h-12 w-12 text-cream/40" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
          {t("forSale")}
        </span>
        <span className="absolute bottom-4 left-4 font-display text-2xl font-semibold text-cream drop-shadow">
          {priceFmt.format(listing.priceUsd)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold text-navy">
          {listing.name}
        </h3>
        <p className="mt-1 inline-flex items-start gap-1.5 text-sm text-navy-600">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
            aria-hidden="true"
          />
          {listing.address}, {listing.city}, {listing.state}
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-navy-100 pt-4 text-sm text-navy-700">
          {specs.map(({ Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-navy-400" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>

        <Link
          href="/contact-us"
          className="mt-5 inline-flex self-start text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold"
        >
          {t("inquire")}
        </Link>
      </div>
    </article>
  );
}
