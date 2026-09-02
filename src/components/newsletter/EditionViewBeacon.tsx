"use client";

import { useEffect } from "react";

// Tells the CRM that this edition was read here, on ajrealestateva.com.
//
// Without it, an edition's read count only reflects the ITMANO-hosted archive
// and stays at zero for every reader who arrives through this site — which is
// where we send them. The CRM decides whether the view counts (published
// edition, one per visitor per 24h); we only report it.
//
// Same shape as the CRM's own beacon: a `text/plain` body so the request stays
// a simple one (no preflight), `keepalive` so it survives the visitor leaving,
// and the endpoint proxied through this domain by next.config.ts so it is
// first-party — tracker blockers leave it alone.

const VISITOR_KEY = "itmano_visitor_id";

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function EditionViewBeacon({ editionId }: { editionId: string }) {
  useEffect(() => {
    try {
      fetch("/api/newsletters/view", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ editionId, visitorId: visitorId() }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* a beacon must never break the page */
    }
  }, [editionId]);

  return null;
}
