// No analytics provider is wired into this site yet. Events go to the page's
// dataLayer when one exists (GTM/GA can pick them up later) and to the console
// in development, always carrying the campaign `src` and the agent.

type Props = Record<string, string | number | boolean | undefined>;

let context: { src: string; agent: string } = { src: "", agent: "melany" };

export function setTrackContext(next: { src: string; agent: string }) {
  context = next;
}

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...context, ...props };
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push(payload);
  if (process.env.NODE_ENV !== "production") console.debug("[giveaway]", payload);
}
