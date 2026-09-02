import Script from "next/script";

// Medición de vistas del CRM.
//
// Sin esto, "Vistas" y "Conversión" de la fuente se quedan en cero para siempre:
// el CRM ve los envíos pero no cuánta gente llegó a la página y no la llenó, que
// es justo lo que dice si el problema está en el tráfico o en el formulario.
//
// Se carga desde una ruta LOCAL, que next.config.ts reescribe al CRM: así la
// medición es first-party y no la tocan los bloqueadores de rastreo ni el
// bot-check del otro dominio. intake.js deriva su base de su propio `src`.
export function ItmanoBeacon({ channelPublicId }: { channelPublicId: string }) {
  if (!channelPublicId) return null;
  return (
    <Script
      src={"/intake.js"}
      data-channel={channelPublicId}
      strategy="afterInteractive"
    />
  );
}
