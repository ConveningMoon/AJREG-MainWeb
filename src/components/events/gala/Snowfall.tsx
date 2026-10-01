"use client";

import { useEffect, useRef } from "react";

type Flake = { x: number; y: number; r: number; speed: number; drift: number; phase: number; alpha: number };

// Slow, sparse snowfall behind the hero. Pauses off screen and in background
// tabs; under prefers-reduced-motion it paints one still frame and stops.
export function Snowfall({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let flakes: Flake[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let last = performance.now();

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(110, (width * height) / 11000));
      flakes = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.6 + depth * 1.9,
          speed: 8 + depth * 26,
          drift: 6 + Math.random() * 14,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.25 + depth * 0.55,
        };
      });
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        f.y += f.speed * dt;
        f.phase += dt * 0.6;
        const x = f.x + Math.sin(f.phase) * f.drift;
        if (f.y - f.r > height) {
          f.y = -f.r;
          f.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 247, 245, ${f.alpha})`;
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    seed();
    draw(0);

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(() => {
      seed();
      draw(0);
    });
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
