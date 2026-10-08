// One short burst of petals, hearts and gold when the result appears
// (canvas-confetti, loaded on demand). `disableForReducedMotion` makes the
// library itself skip it for people who asked for less motion.

export async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  const heart = confetti.shapeFromPath({
    path: "M167 72c19-38 37-56 75-56 42 0 76 33 75 75-1 31-23 58-48 82-26 25-56 46-100 78-44-32-74-53-100-78-25-24-47-51-48-82-1-42 33-75 75-75 38 0 56 18 71 56z",
  });
  const petal = confetti.shapeFromPath({
    path: "M20 2C32 14 38 30 30 44 26 51 22 54 20 54 18 54 14 51 10 44 2 30 8 14 20 2Z",
  });
  const colors = ["#f0a6b6", "#fbd5dc", "#f6b9a5", "#c7a260", "#e7c98d", "#dba3cb"];
  const base = {
    colors,
    shapes: [petal, heart, "circle"] as never[],
    scalar: 1.1,
    disableForReducedMotion: true,
    zIndex: 40,
    ticks: 220,
    gravity: 0.7,
  };
  confetti({ ...base, particleCount: 36, angle: 60, spread: 62, origin: { x: 0, y: 0.7 }, startVelocity: 48 });
  confetti({ ...base, particleCount: 36, angle: 120, spread: 62, origin: { x: 1, y: 0.7 }, startVelocity: 48 });
}
