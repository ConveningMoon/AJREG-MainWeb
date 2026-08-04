import Script from "next/script";

// Medición de vistas del CRM.
//
// Sin esto, "Vistas" y "Conversión" de la fuente se quedan en cero para siempre:
// el CRM ve los envíos pero no cuánta gente llegó a la página y no la llenó, que
// es justo lo que dice si el problema está en el tráfico o en el formulario.
//
// `intake.js` lo sirve el propio CRM y se encarga del resto (huella del
// visitante, UTMs y el POST a /api/intake/<canal>/view). Sólo hay que decirle
// de qué canal es esta página.
const CRM_BASE = process.env.NEXT_PUBLIC_ITMANO_URL ?? "https://app.itmano.com";

export function ItmanoBeacon({ channelPublicId }: { channelPublicId: string }) {
  if (!channelPublicId) return null;
  return (
    <Script
      src={`${CRM_BASE}/intake.js`}
      data-channel={channelPublicId}
      strategy="afterInteractive"
    />
  );
}
