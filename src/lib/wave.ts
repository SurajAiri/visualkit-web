// Deterministic waveform heights (percent). No Math.random so server renders stay stable.
export function wave(count: number, seed = 1): number[] {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin((i + seed) * 1.7) * 0.5 + 0.5;
    const b = Math.sin((i + seed * 3) * 0.55) * 0.5 + 0.5;
    return Math.round(22 + (a * 0.6 + b * 0.4) * 70);
  });
}
