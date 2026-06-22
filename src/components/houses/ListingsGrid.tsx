import { getTranslations } from "next-intl/server";
import type { Listing } from "@/data/listings";
import { PropertyCard } from "./PropertyCard";

export async function ListingsGrid({ listings }: { listings: Listing[] }) {
  const t = await getTranslations("houses");

  if (listings.length === 0) {
    return (
      <p className="rounded-2xl bg-blush/40 px-6 py-12 text-center text-navy-700">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
