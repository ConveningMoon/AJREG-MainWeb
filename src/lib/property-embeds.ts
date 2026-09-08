// Lado de lectura de `properties.web_embeds` (migración 113 del CRM): tours 3D,
// videos y mapas que un agente pega en la ficha de una propiedad.
//
// El CRM ya guarda SÓLO la url normalizada, nunca el `<iframe>` que pega el
// agente. Aquí se revalida igual: la base es un sistema aparte, editable desde
// otro producto, y una url que llegue con un host que no esperamos no debe
// acabar en un iframe de esta web. La frontera de seguridad es la lista blanca
// de HOSTS; las reglas de ruta existen para no embeber enlaces que el navegador
// se negaría a mostrar (la ficha de Zillow, el enlace de compartir de Maps),
// que dejarían un recuadro en blanco sin ningún error.
//
// Espejo de `src/lib/services/property-embeds.ts` en el CRM. Si allá cambia la
// lista de proveedores, cambia aquí.

export const EMBED_PLACEMENTS = ["tour", "extra"] as const;
export type EmbedPlacement = (typeof EMBED_PLACEMENTS)[number];

export const EMBED_PROVIDERS = ["zillow", "matterport", "iguide", "youtube", "vimeo", "gmaps"] as const;
export type EmbedProvider = (typeof EMBED_PROVIDERS)[number];

export type PropertyEmbed = {
  url: string;
  provider: EmbedProvider;
  title: string | null;
  placement: EmbedPlacement;
};

const MAX_EMBEDS = 6;
const MAX_EMBED_URL = 500;

// Nombres propios de producto: no se traducen.
export const PROVIDER_LABEL: Record<EmbedProvider, string> = {
  zillow: "Zillow 3D Home",
  matterport: "Matterport",
  iguide: "iGuide",
  youtube: "YouTube",
  vimeo: "Vimeo",
  gmaps: "Google Maps",
};

const HOSTS: Record<EmbedProvider, readonly string[]> = {
  zillow: ["www.zillow.com", "zillow.com"],
  matterport: ["my.matterport.com"],
  iguide: ["youriguide.com", "www.youriguide.com", "unbranded.youriguide.com"],
  youtube: ["www.youtube.com", "youtube.com", "m.youtube.com", "www.youtube-nocookie.com", "youtu.be"],
  vimeo: ["player.vimeo.com", "vimeo.com", "www.vimeo.com"],
  gmaps: ["www.google.com", "google.com", "maps.google.com"],
};

const HOST_TO_PROVIDER: ReadonlyMap<string, EmbedProvider> = new Map(
  EMBED_PROVIDERS.flatMap((p) => HOSTS[p].map((h) => [h, p] as [string, EmbedProvider])),
);

// Un mapa se lee mejor más alto que ancho; los tours y los videos son 16/9.
export function embedAspectRatio(provider: EmbedProvider): string {
  return provider === "gmaps" ? "4 / 3" : "16 / 9";
}

// El CRM guarda la url pelada, pero la fila puede haber sido editada a mano con
// el snippet completo que da el botón de compartir del proveedor. Se acepta:
// de ese texto sólo se saca el src, que pasa por la misma lista blanca. Lo que
// nunca se hace es pintar el HTML tal cual.
const IFRAME_SRC = /<iframe\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

// El src de un snippet copiado de una página ya renderizada trae entidades: sin
// decodificarlas, `?m=x&amp;play=1` pierde el segundo parámetro.
function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#0*38;/g, "&")
    .replace(/&amp;/gi, "&");
}

const YT_ID = /^[A-Za-z0-9_-]{6,20}$/;
const VIMEO_ID = /^\d{5,15}$/;

/** Url embebible normalizada, o `null` si no pasa la lista blanca. */
function parseEmbedUrl(raw: string): { url: string; provider: EmbedProvider } | null {
  const input = (raw ?? "").trim();
  if (!input) return null;

  const match = input.includes("<iframe") ? IFRAME_SRC.exec(input) : null;
  const candidate = match
    ? decodeEntities((match[1] ?? match[2] ?? match[3] ?? "").trim())
    : (input.includes("<") ? "" : input);
  if (!candidate) return null;

  let u: URL;
  try {
    u = new URL(candidate);
  } catch {
    return null;
  }

  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  u.protocol = "https:";
  u.hash = "";

  const provider = HOST_TO_PROVIDER.get(u.hostname);
  if (!provider) return null;

  const url = normalizeFor(provider, u);
  if (!url || url.length > MAX_EMBED_URL) return null;
  return { url, provider };
}

function normalizeFor(provider: EmbedProvider, u: URL): string | null {
  switch (provider) {
    case "zillow":
      // Sólo el visor IMX (3D Home). La ficha /homedetails/ bloquea el framing.
      if (!u.pathname.startsWith("/view-imx/")) return null;
      u.hostname = "www.zillow.com";
      return u.toString();

    case "matterport":
      if (!u.pathname.startsWith("/show")) return null;
      return u.toString();

    case "iguide":
      return u.toString();

    case "youtube": {
      const id = youtubeId(u);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    case "vimeo": {
      const id = vimeoId(u);
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    case "gmaps":
      // El enlace de compartir (maps.app.goo.gl, /maps/place/…) no se embebe.
      if (!u.pathname.startsWith("/maps/embed")) return null;
      u.hostname = "www.google.com";
      return u.toString();
  }
}

function youtubeId(u: URL): string | null {
  const seg = u.pathname.split("/").filter(Boolean);
  const candidate =
    u.hostname === "youtu.be"                   ? seg[0]
    : seg[0] === "embed" || seg[0] === "shorts" ? seg[1]
    : seg[0] === "watch"                        ? (u.searchParams.get("v") ?? undefined)
    : u.pathname === "/watch"                   ? (u.searchParams.get("v") ?? undefined)
    : undefined;
  return candidate && YT_ID.test(candidate) ? candidate : null;
}

function vimeoId(u: URL): string | null {
  const seg = u.pathname.split("/").filter(Boolean);
  const candidate = seg[0] === "video" ? seg[1] : seg[0];
  return candidate && VIMEO_ID.test(candidate) ? candidate : null;
}

/**
 * Lee la columna jsonb `properties.web_embeds`. Defensivo a propósito: la fila
 * puede venir de una versión anterior del formulario del CRM o de una edición a
 * mano, y un embed mal formado no debe tumbar la ficha — se descarta.
 */
export function toPropertyEmbeds(value: unknown): PropertyEmbed[] {
  if (!Array.isArray(value)) return [];
  const out: PropertyEmbed[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const parsed = parseEmbedUrl(typeof row.url === "string" ? row.url : "");
    if (!parsed) continue;
    const placement = EMBED_PLACEMENTS.includes(row.placement as EmbedPlacement)
      ? (row.placement as EmbedPlacement)
      : "tour";
    const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : null;
    out.push({ url: parsed.url, provider: parsed.provider, title, placement });
    if (out.length >= MAX_EMBEDS) break;
  }
  return out;
}
