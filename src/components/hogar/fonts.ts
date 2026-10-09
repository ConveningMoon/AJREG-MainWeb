import { Bowlby_One } from "next/font/google";

// Sign-painter display voice for the /hogar campaign only (headlines and the
// painted price). Everything readable stays in the site's Montserrat.
export const signFont = Bowlby_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sign",
});
