/**
 * "Our Sales" success stories from the current site. Quotes stay in Spanish for
 * every locale (real client words). Thumbnails/videos are not available yet, so
 * the UI uses a branded placeholder until the real media is provided.
 */
export type SalesStory = {
  id: string;
  family: string;
  quote: string;
};

export const salesStories: SalesStory[] = [
  {
    id: "maduro-1",
    family: "Maduro",
    quote:
      "Nuestro hijo necesitaba una casa, un paso tan grande donde Adriana encontró la propiedad perfecta en solo 3 semanas. ¡Es el hogar perfecto para tres generaciones!",
  },
  {
    id: "flores-1",
    family: "Flores",
    quote:
      "Buscábamos barrio seguro y buenas escuelas. Adriana, como madre de tres, entendió nuestras necesidades perfectamente. En dos meses encontramos la casa ideal con patio enorme. Nos dio el futuro que soñábamos para nuestros hijos.",
  },
  {
    id: "garcia-1",
    family: "García",
    quote:
      "Con horarios impredecibles de militar, Adriana se adaptó completamente. Me ayudó con mi préstamo VA y encontramos un townhouse perfecto. Adriana hizo que me sintiera como en familia desde el primer día.",
  },
  {
    id: "maduro-2",
    family: "Maduro",
    quote:
      "Como padres primerizos con presupuesto ajustado, nos sentíamos abrumados. Adriana nos tranquilizó y encontró programas de asistencia. En dos meses teníamos nuestro hogar con nursery perfecta. Fue como tener una hermana mayor guiándonos.",
  },
];
