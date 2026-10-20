"use client";

import dynamic from "next/dynamic";

const Snowfall = dynamic(() => import("./Snowfall").then((module) => module.Snowfall), { ssr: false });

export function RsvpInvitation({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="gala-rsvp-atmosphere" aria-hidden="true"><Snowfall className="absolute inset-0 h-full w-full" /></div>
      <div className="relative z-10">
        {children}
      </div>
    </>
  );
}
