export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(seed: string, stream: string): () => number {
  return mulberry32(hashSeed(`${seed}:${stream}`));
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomSeed(): string {
  const rand = mulberry32((Math.random() * 0xffffffff) >>> 0);
  let out = "VX-";
  for (let i = 0; i < 4; i++) out += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  return out;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function pickIndex(seed: string, stream: string, length: number): number {
  if (length <= 0) return 0;
  return hashSeed(`${seed}:${stream}`) % length;
}
