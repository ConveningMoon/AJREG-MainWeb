export type GoogleReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

export type PlaceReviewData = {
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
};

export const googleReviewsData: PlaceReviewData = {
  rating: 4.9,
  totalReviews: 47,
  reviews: [
    {
      id: "garcia-m",
      author: "María García",
      rating: 5,
      text: "Adriana fue increíble durante todo el proceso de compra. Siempre estuvo disponible para contestar nuestras preguntas y nos guió paso a paso. Gracias a ella encontramos el hogar perfecto para nuestra familia. ¡Totalmente recomendada!",
      relativeTime: "hace 2 meses",
    },
    {
      id: "torres-c",
      author: "Carlos Torres",
      rating: 5,
      text: "Working with the A&J team was the best decision we made during our PCS move. They understood our military situation perfectly and found us a home near the base quickly. Professional, responsive, and truly caring. Five stars!",
      relativeTime: "hace 3 meses",
    },
    {
      id: "mendoza-l",
      author: "Lucía Mendoza",
      rating: 5,
      text: "Como compradora primeriza, estaba muy nerviosa con todo el proceso. Adriana me explicó cada paso con paciencia y dedicación. Nunca me sentí sola en este camino. Hoy tenemos nuestra primera casa y no podría estar más feliz.",
      relativeTime: "hace 1 mes",
    },
    {
      id: "jimenez-r",
      author: "Roberto Jiménez",
      rating: 5,
      text: "Vendimos nuestra casa en menos de dos semanas gracias a la estrategia de Adriana. Su conocimiento del mercado de Hampton Roads es impresionante. Profesional, honesta y siempre pensando en el cliente. ¡Excelente experiencia!",
      relativeTime: "hace 4 meses",
    },
    {
      id: "reyes-a",
      author: "Ana Reyes",
      rating: 5,
      text: "El equipo de A&J nos ayudó a encontrar nuestra casa en un mercado muy competitivo. Su dedicación y conocimiento del área fue clave para que pudiéramos ganar la oferta. Los recomendamos ampliamente a cualquier familia que quiera comprar en Virginia.",
      relativeTime: "hace 5 meses",
    },
  ],
};
