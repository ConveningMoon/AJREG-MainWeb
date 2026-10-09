"use client";

// Slow drifting papel-picado confetti behind the whole flow (tsParticles, slim
// bundle). Loaded lazily after first paint by HogarCalculator and skipped for
// people who asked for reduced motion or a data saver, so it can never touch
// the page's load time.

import { useMemo } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function PapelParticles() {
  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 24,
      detectRetina: false,
      background: { color: { value: "transparent" } },
      particles: {
        number: { value: 16, density: { enable: false } },
        color: { value: ["#c8185f", "#0a7a76", "#fff7f5", "#102037"] },
        shape: { type: ["square", "triangle", "circle"] },
        opacity: { value: { min: 0.45, max: 0.85 } },
        size: { value: { min: 4, max: 9 } },
        rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 8 } },
        move: {
          enable: true,
          direction: "bottom",
          speed: { min: 0.35, max: 0.9 },
          straight: false,
          outModes: { default: "out" },
          random: true,
          drift: { min: -0.8, max: 0.8 },
        },
      },
    } as ISourceOptions),
    [],
  );

  return (
    <ParticlesProvider init={loadSlim}>
      <Particles id="hogar-papel" options={options} className="pointer-events-none absolute inset-0" />
    </ParticlesProvider>
  );
}
