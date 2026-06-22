/**
 * Client testimonials from the current site.
 *
 * Per project policy the quotes stay in Spanish for every locale (they are real
 * client words and must not be translated). Only the surrounding UI labels are
 * localized. `family` is the surname; the "Family/Familia" word is added in the
 * UI via i18n.
 */
export type Testimonial = {
  id: string;
  family: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "garcia",
    family: "García",
    quote:
      "Adriana entiende las necesidades de las familias porque ella también es mamá. Nos encontró una casa con el patio perfecto para los niños. ¡Gracias por todo!",
  },
  {
    id: "vazquez",
    family: "Vázquez",
    quote:
      "Profesional, confiable y muy dedicada. Adriana vendió nuestra casa y nos ayudó a comprar una nueva. Su conocimiento del mercado es impresionante.",
  },
  {
    id: "maduro",
    family: "Maduro",
    quote:
      "Adriana hizo que mudarnos con tres niños pequeños fuera mucho más fácil. Su paciencia y dedicación fueron extraordinarias. ¡La mejor agente de bienes raíces!",
  },
  {
    id: "flores",
    family: "Flores",
    quote:
      "Vendimos nuestra casa en tiempo récord gracias a Adriana. Su estrategia de marketing es increíble y siempre estuvo disponible para nuestras preguntas. Una profesional excepcional.",
  },
  {
    id: "ramirez",
    family: "Ramírez",
    quote:
      "Adriana nos ayudó a encontrar la casa perfecta para nuestra familia de 5. Su experiencia como mamá la hizo entender exactamente lo que necesitábamos. ¡Súper recomendada!",
  },
  {
    id: "cuevas",
    family: "Cuevas",
    quote:
      "Como compradores primerizos, Adriana nos guió paso a paso. Hizo que el proceso fuera fácil y sin estrés. Ahora tenemos el hogar de nuestros sueños para nuestros hijos.",
  },
];
