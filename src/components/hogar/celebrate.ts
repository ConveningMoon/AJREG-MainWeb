// One burst of papel-picado confetti when the result sign is hung
// (canvas-confetti, loaded on demand). `disableForReducedMotion` makes the
// library itself skip it for people who asked for less motion.

export async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  const base = {
    colors: ["#c8185f", "#0a7a76", "#fff7f5", "#102037", "#ffd45a"],
    shapes: ["square", "circle"] as ("square" | "circle")[],
    scalar: 1.05,
    disableForReducedMotion: true,
    zIndex: 40,
    ticks: 240,
    gravity: 0.8,
  };
  confetti({ ...base, particleCount: 40, angle: 60, spread: 65, origin: { x: 0, y: 0.75 }, startVelocity: 50 });
  confetti({ ...base, particleCount: 40, angle: 120, spread: 65, origin: { x: 1, y: 0.75 }, startVelocity: 50 });
}
