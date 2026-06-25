export type SalesStory = {
  id: string;
  family: string;
  quote: string;
  videoUrl?: string;  // YouTube URL (unlisted) — family testimonial video
};

export const salesStories: SalesStory[] = [
  {
    id: "maduro-1",
    family: "Maduro",
    quote:
      "Nuestro hijo necesitaba una casa, un paso tan grande donde Adriana encontró la propiedad perfecta en solo 3 semanas. ¡Es el hogar perfecto para tres generaciones!",
	videoUrl: "https://youtube.com/shorts/ZZpM9FFhK-g",
  },
  {
    id: "flores-1",
    family: "Flores",
    quote:
      "Buscábamos barrio seguro y buenas escuelas. Adriana, como madre de tres, entendió nuestras necesidades perfectamente. En dos meses encontramos la casa ideal con patio enorme. Nos dio el futuro que soñábamos para nuestros hijos.",
	videoUrl: "https://youtube.com/shorts/RZh5zTODp6o",
  },
  {
    id: "garcia-1",
    family: "García",
    quote:
      "Con horarios impredecibles de militar, Adriana se adaptó completamente. Me ayudó con mi préstamo VA y encontramos un townhouse perfecto. Adriana hizo que me sintiera como en familia desde el primer día.",
	  videoUrl: "https://youtube.com/shorts/WoDq5KVB7gY",
  },
  {
    id: "maduro-2",
    family: "Maduro",
    quote:
      "Como padres primerizos con presupuesto ajustado, nos sentíamos abrumados. Adriana nos tranquilizó y encontró programas de asistencia. En dos meses teníamos nuestro hogar con nursery perfecta. Fue como tener una hermana mayor guiándonos.",
	  videoUrl: "https://youtube.com/shorts/021_pgulE88",
  },
  {
    id: "vazquez-1",
    family: "Vázquez",
    quote:
      "Adriana nos guió paso a paso siendo compradores primerizos. Su paciencia y su conocimiento del mercado hicieron que todo fuera mucho más sencillo de lo que imaginábamos. ¡Hoy tenemos nuestra primera casa!",
	  videoUrl: "https://youtube.com/shorts/kAQHxDZZUcc",
  },
  {
    id: "ramirez-1",
    family: "Ramírez",
    quote:
      "Teníamos miedo de dar el primer paso, pero Adriana nos acompañó en cada decisión. Su dedicación y su calidez son incomparables. Gracias a ella, encontramos nuestro hogar perfecto en tiempo récord.",
	  videoUrl: "https://youtube.com/shorts/tr7GwhM0L1k",
  },
];
