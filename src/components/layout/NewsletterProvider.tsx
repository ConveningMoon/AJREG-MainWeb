"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { NewsletterModal } from "./NewsletterModal";

const NewsletterContext = createContext<() => void>(() => {});

/** Open the newsletter modal from anywhere (navbar CTA, hero, etc.). */
export function useNewsletter() {
  return useContext(NewsletterContext);
}

export function NewsletterProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);

  return (
    <NewsletterContext.Provider value={openModal}>
      {children}
      <NewsletterModal open={open} onClose={() => setOpen(false)} />
    </NewsletterContext.Provider>
  );
}
