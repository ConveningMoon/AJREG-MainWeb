import { ExternalLink } from "lucide-react";
import {
  PROVIDER_LABEL,
  embedAspectRatio,
  type PropertyEmbed,
} from "@/lib/property-embeds";

type Props = {
  embeds: PropertyEmbed[];
  /** Título de la sección, ya traducido. */
  title: string;
  /** Patrón "Abrir en {provider}", ya traducido. */
  openLabel: string;
  /** Nombre de la propiedad, para el título accesible del iframe. */
  name: string;
};

/**
 * Tours 3D, videos y mapas que vienen de `properties.web_embeds`. La página
 * construye su propio `<iframe>` a partir de la url ya validada contra la lista
 * blanca de proveedores — nunca se pinta el HTML que pegó el agente.
 *
 * No renderiza nada si la propiedad no tiene embeds de este tipo.
 */
export function PropertyEmbeds({ embeds, title, openLabel, name }: Props) {
  if (embeds.length === 0) return null;

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
      <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>

      <div className="mt-4 space-y-6">
        {embeds.map((embed) => {
          const providerLabel = PROVIDER_LABEL[embed.provider];
          const frameTitle = embed.title ?? `${name} — ${providerLabel}`;

          return (
            <figure key={embed.url}>
              <div
                className="overflow-hidden rounded-xl bg-navy-950 ring-1 ring-navy-900/10"
                style={{ aspectRatio: embedAspectRatio(embed.provider) }}
              >
                <iframe
                  src={embed.url}
                  title={frameTitle}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; encrypted-media; fullscreen; gyroscope; picture-in-picture; xr-spatial-tracking"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>

              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center rounded-sm bg-navy-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-navy-600">
                    {providerLabel}
                  </span>
                  {embed.title && (
                    <span className="text-sm text-navy-700">{embed.title}</span>
                  )}
                </span>

                {/* Salida de emergencia: si el proveedor se niega a que lo
                    embeban, el recuadro queda en blanco y este enlace es lo
                    único que le queda al visitante. */}
                <a
                  href={embed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {openLabel.replace("{provider}", providerLabel)}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
