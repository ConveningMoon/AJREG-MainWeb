import type { SponsorTierId } from "@/data/christmasGala";

// Any "Apply for <tier>" button on the page hands its tier to the form
// through this event, then brings the form into view.
export const TIER_EVENT = "gala:select-tier";

export function selectTierAndScroll(tier?: SponsorTierId) {
  if (tier) {
    window.dispatchEvent(new CustomEvent<SponsorTierId>(TIER_EVENT, { detail: tier }));
  }
  const target = document.getElementById("apply");
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
