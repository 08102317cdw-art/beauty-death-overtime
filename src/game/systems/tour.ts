import { RIVALS, seatFrom, type RivalTemplate } from "../content/cast";
import { hashSeed, rngFor } from "../rng";
import type { BoonId, Seat } from "../types";
import { aiNumber, converge, withoutBlame } from "./contest";

const EXTREMES = new Set([0, 1, 99, 100]);

export function isExtreme(n: number | null): boolean {
  return n !== null && EXTREMES.has(n);
}

function shuffle<T>(items: T[], seed: string, stream: string): T[] {
  const rng = rngFor(seed, stream);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j] as T;
    copy[j] = swap as T;
  }
  return copy;
}

function unique(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

const POOL = RIVALS.filter((rival) => rival.id !== "king");

export function drawRivalIds(seed: string, trial: 1 | 2 | 3, scars: string[]): string[] {
  const poolIds = POOL.map((rival) => rival.id);
  const scarred = scars.filter((id) => poolIds.includes(id));
  if (trial === 3) {
    const rest = shuffle(poolIds, seed, "court3");
    return ["king", ...unique([...scarred, ...rest]).slice(0, 3)];
  }
  const shuffled = shuffle(poolIds, seed, `court${trial}`);
  if (trial === 1) return shuffled.slice(0, 4);
  return unique([...scarred, ...shuffled]).slice(0, 4);
}

export function rewardOrder(seed: string, afterTrial: 1 | 2): BoonId[] {
  return shuffle<BoonId>(["glimpse", "imprint", "reprieve"], seed, `reward${afterTrial}`);
}

export function glimpseTarget(seed: string, trial: 1 | 2 | 3, ids: string[]): string | null {
  const rivals = ids.filter((id) => id !== "king");
  if (rivals.length === 0) return null;
  const rng = rngFor(seed, `glimpse${trial}`);
  return rivals[Math.floor(rng() * rivals.length)] ?? null;
}

export function depthBand(depth: number): string {
  if (depth <= 0) return "0–1 层";
  if (depth === 1) return "1–2 层";
  if (depth === 2) return "2–3 层";
  return "3 层以外";
}

export function buildCourt(
  playerName: string,
  seed: string,
  trial: 1 | 2 | 3,
  scars: string[],
  revealId: string | null,
): Seat[] {
  const name = playerName.trim().slice(0, 8) || "七号";
  const player: Seat = {
    id: "player",
    name,
    epithet: "未具名",
    role: "player",
    depth: 0,
    bio: "案卷上的名字可以改。分数不行。",
    look: {
      hair: "crop",
      mark: "earring",
      hairColor: "#2a2422",
      lip: "#c48b8f",
      wash: "#100c0c",
      metal: "#d9d0bc",
      smile: false,
      coverEye: false,
    },
    score: 0,
    alive: true,
    scarred: false,
    revealed: false,
  };
  const ids = drawRivalIds(seed, trial, scars);
  const rivals = ids.map((id) => {
    const template = RIVALS.find((rival) => rival.id === id) as RivalTemplate;
    return seatFrom(template, scars.includes(id), revealId === id);
  });
  return [player, ...rivals];
}

export interface MindContext {
  seed: string;
  trial: number;
  round: number;
  duel: boolean;
  playerLast: number | null;
}

function nudgeOff(n: number, step: number): number {
  const next = n + step;
  if (next > 100) return Math.max(0, n - step);
  if (next < 0) return Math.min(100, n + Math.abs(step));
  return next;
}

function guardFrom(base: number, playerLast: number | null): number {
  if (playerLast === null) return nudgeOff(base, 4);
  if (Math.abs(base - playerLast) <= 5) return nudgeOff(base, playerLast >= base ? -4 : 4);
  return base;
}

function chaosHash(seed: string, trial: number, round: number): number {
  return hashSeed(`${seed}:t${trial}:chaos:${round}`);
}

function extremeOf(seed: string, trial: number, round: number): number {
  const h = chaosHash(seed, trial, round);
  return [0, 100, 99, 1][(h >>> 4) % 4] ?? 0;
}

function chaosSpikes(seed: string, trial: number, round: number, scarred: boolean): boolean {
  const h = chaosHash(seed, trial, round);
  return scarred ? h % 3 === 0 : h % 4 === 0;
}

function baseIntent(seat: Seat, ctx: MindContext): number {
  if (seat.role === "king") return withoutBlame(converge(2), ctx.duel);
  if (seat.role === "rational") return converge(seat.scarred ? 2 : 1);
  if (seat.role === "deep") return seat.scarred ? guardFrom(converge(3), ctx.playerLast) : converge(3);
  if (seat.role === "chaos") {
    return chaosSpikes(ctx.seed, ctx.trial, ctx.round, seat.scarred)
      ? extremeOf(ctx.seed, ctx.trial, ctx.round)
      : converge(0);
  }
  if (seat.role === "mirror") {
    const copied = ctx.playerLast ?? converge(1);
    return seat.scarred ? nudgeOff(copied, 1) : copied;
  }
  if (seat.role === "grudge") {
    if (!seat.scarred || ctx.playerLast === null) return converge(2);
    if (ctx.playerLast >= 70) return 0;
    if (ctx.playerLast <= 15) return withoutBlame(100, ctx.duel);
    return converge(2);
  }
  return aiNumber(seat.role, ctx.seed, ctx.round, ctx.duel, ctx.trial);
}

function median(values: number[]): number {
  if (values.length === 0) return converge(1);
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const left = sorted[mid - 1];
  const right = sorted[mid];
  if (sorted.length % 2 === 0 && left !== undefined && right !== undefined) return Math.round((left + right) / 2);
  return right ?? converge(1);
}

export function courtIntents(seats: Seat[], ctx: MindContext): Map<string, number> {
  const alive = seats.filter((seat) => seat.alive && seat.role !== "player");
  const intents = new Map<string, number>();
  for (const seat of alive) {
    if (seat.role === "conform") continue;
    intents.set(seat.id, baseIntent(seat, ctx));
  }
  const peers = [...intents.values()];
  for (const seat of alive) {
    if (seat.role !== "conform") continue;
    const mid = median(peers);
    intents.set(seat.id, seat.scarred ? nudgeOff(mid, ctx.playerLast !== null && ctx.playerLast > mid ? -3 : 3) : mid);
  }
  return intents;
}
