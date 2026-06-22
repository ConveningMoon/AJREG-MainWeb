import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware wrappers around Next.js navigation APIs.
// Using these (instead of next/link, next/navigation) keeps the active
// locale in the URL and lets the EN/ES toggle preserve the current route.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
