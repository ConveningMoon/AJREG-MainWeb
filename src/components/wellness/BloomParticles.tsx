"use client";

// Drifting petals and gold sparkles behind the quiz (tsParticles, slim bundle).
// Loaded lazily after first paint by WellnessCheck and skipped entirely for
// people who asked for reduced motion or a data saver, so it can never touch
// the quiz's load time.

import { useMemo } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

const petal = (from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><path d="M20 2C32 14 38 30 30 44 26 51 22 54 20 54 18 54 14 51 10 44 2 30 8 14 20 2Z" fill="url(#g)"/></svg>`,
  )}`;

const PETALS = [
  petal("#fbd5dc", "#f0a6b6"),
  petal("#fde4d8", "#f6b9a5"),
  petal("#f7d0e6", "#dba3cb"),
];

export default function BloomParticles() {
  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 24,
      detectRetina: false,
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 11, density: { enable: false } },
        shape: {
          type: "image",
          options: {
            image: PETALS.map((src) => ({ src, width: 40, height: 56 })),
          },
        },
        opacity: { value: { min: 0.35, max: 0.8 } },
        size: { value: { min: 10, max: 22 } },
        rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 6 } },
        move: {
          enable: true,
          direction: "bottom",
          speed: { min: 0.4, max: 1.1 },
          straight: false,
          outModes: { default: "out" },
          random: true,
          drift: { min: -1, max: 1 },
        },
      },
    } as ISourceOptions),
    [],
  );

  return (
    <ParticlesProvider init={loadSlim}>
      <Particles id="wellness-petals" options={options} className="pointer-events-none absolute inset-0" />
    </ParticlesProvider>
  );
}
