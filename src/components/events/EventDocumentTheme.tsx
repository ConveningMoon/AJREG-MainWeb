"use client";

import { useEffect } from "react";

export function EventDocumentTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("feel-good-social-scroll");
    return () => root.classList.remove("feel-good-social-scroll");
  }, []);

  return null;
}
