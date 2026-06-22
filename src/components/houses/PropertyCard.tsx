import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Home, MapPin } from "lucide-react";
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

  const specsText = [
    t("beds", { count: listing.bedrooms }),
    t("baths", { count: bathsLabel }),
    t("sqft", { count: listing.sqft.toLocaleString("en-US") }),
  ].join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-lg">
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
        <span className="absolute left-4 top-4 rounded-sm bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
          {t("forSale")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-3xl font-semibold text-navy">
          {priceFmt.format(listing.priceUsd)}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-navy">
          {listing.name}
        </h3>
        <p className="mt-1 inline-flex items-start gap-1.5 text-sm text-navy-600">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
            aria-hidden="true"
          />
          {listing.address}, {listing.city}, {listing.state}
        </p>

        <p className="mt-4 border-t border-navy-100 pt-4 text-sm tracking-wide text-navy-500">
          {specsText}
        </p>

        <Link
          href="/contact-us"
          className="mt-5 inline-flex self-start rounded-sm border border-navy-300 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:bg-gold hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("inquire")}
        </Link>
      </div>
    </article>
  );
}
