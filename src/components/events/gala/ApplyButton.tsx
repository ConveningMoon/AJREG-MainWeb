"use client";

import type { ReactNode } from "react";
import type { SponsorTierId } from "@/data/christmasGala";
import { selectTierAndScroll } from "./tier-select";

// A real link to #apply (works without JS), upgraded to also preselect the tier.
export function ApplyButton({
  tier,
  className,
  children,
}: {
  tier?: SponsorTierId;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#apply"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        selectTierAndScroll(tier);
      }}
    >
      {children}
    </a>
  );
}
