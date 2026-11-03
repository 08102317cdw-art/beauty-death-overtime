import { hashSeed } from "../rng";
import type { ClauseId, Role, RoundOutcome, RoundRow, Seat, Submitted } from "../types";

export const ELIMINATION_SCORE = -10;
export const DIGEST_SECONDS = 5 * 60;
export const TURN_SECONDS = 60;

/** Keynes step: naive anchor 50, then `depth` times round(n × 0.8). */
export function converge(depth: number): number {
  let n = 50;
  for (let i = 0; i < depth; i++) n = Math.round(n * 0.8);
  return n;
}

export function rulesNow(eliminatedCount: number, aliveCount: number): {
  duplicate: boolean;
  exact: boolean;
  duel: boolean;
} {
  return {
    duplicate: eliminatedCount >= 1,
    exact: eliminatedCount >= 2,
    duel: eliminatedCount >= 3 && aliveCount === 2,
  };
}

export function unlockedClauses(before: number, after: number): ClauseId[] {
  const clauses: ClauseId[] = [];
  if (before < 1 && after >= 1) clauses.push("duplicate");
  if (before < 2 && after >= 2) clauses.push("exact");
  if (before < 3 && after >= 3) clauses.push("duel");
  return clauses;
}

export function turnSeconds(roundNumber: number, freshClauses: boolean): number {
  if (roundNumber <= 1 || freshClauses) return DIGEST_SECONDS;
  return TURN_SECONDS;
}

/** In a duel the King will not take the blame for a predatory 1 or a 100 trap. */
export function withoutBlame(n: number, duel: boolean): number {
  if (duel && (n === 1 || n === 100)) return 0;
  return n;
}

export function aiNumber(role: Role, seed: string, round: number, duel: boolean, trial = 1): number {
  if (role === "player") return 0;
  if (role === "king") return withoutBlame(converge(2), duel);
  if (role === "rational") return converge(1);
  if (role === "deep") return converge(3);
  if (role === "mirror" || role === "conform") return converge(1);
  if (role === "grudge") return converge(2);
  const h = hashSeed(`${seed}:t${trial}:chaos:${round}`);
  if (h % 4 === 0) return [0, 100, 99, 1][(h >>> 4) % 4];
  return converge(0);
}

export interface RoundMods {
  /** Player's exact hit pushes other non-timeout losers one point further. */
  imprint: boolean;
  /** One charge: a duplicated player number steps aside, or a timeout costs nothing. */
  reprieve: boolean;
}

export function resolveRound(
  seats: Seat[],
  submitted: Submitted[],
  eliminatedCount: number,
  mods: RoundMods = { imprint: false, reprieve: false },
): RoundOutcome & { reprieveUsed: "timeout" | "unique" | null } {
  const alive = seats.filter((seat) => seat.alive);
  const byId = new Map(submitted.map((item) => [item.id, item]));
  const rules = rulesNow(eliminatedCount, alive.length);
  let reprieveUsed: "timeout" | "unique" | null = null;
  const rows: RoundRow[] = alive.map((seat) => {
    const choice = byId.get(seat.id);
    const timeout = !choice || choice.number === null;
    return {
      id: seat.id,
      number: timeout ? null : choice.number,
      voidReason: timeout ? "timeout" : null,
      delta: 0,
      eligible: !timeout,
    };
  });

  if (mods.reprieve) {
    const player = rows.find((row) => row.id === "player");
    if (player?.voidReason === "timeout") {
      reprieveUsed = "timeout";
    } else if (player && player.number !== null && rulesNow(eliminatedCount, alive.length).duplicate) {
      const counts = new Map<number, number>();
      for (const row of rows) {
        if (row.number === null) continue;
        counts.set(row.number, (counts.get(row.number) ?? 0) + 1);
      }
      if ((counts.get(player.number) ?? 0) >= 2) {
        const taken = new Set(
          rows.filter((row) => row.id !== "player" && row.number !== null).map((row) => row.number as number),
        );
        const start = player.number;
        let moved = false;
        for (let distance = 1; distance <= 100 && !moved; distance++) {
          for (const sign of [1, -1]) {
            const next = start + sign * distance;
            if (next < 0 || next > 100 || taken.has(next)) continue;
            player.number = next;
            reprieveUsed = "unique";
            moved = true;
            break;
          }
        }
      }
    }
  }

  if (rules.duel) {
    const hasZero = rows.some((row) => row.number === 0);
    const hundreds = rows.filter((row) => row.number === 100);
    if (hasZero && hundreds.length > 0) {
      const winners = new Set(hundreds.map((row) => row.id));
      for (const row of rows) {
        if (winners.has(row.id)) row.delta = 0;
        else if (row.id === "player" && reprieveUsed === "timeout") row.delta = 0;
        else row.delta = -1;
      }
      return { ...finish(seats, rows, null, null, null, "duel", [...winners]), reprieveUsed };
    }
  }

  if (rules.duplicate) {
    const counts = new Map<number, number>();
    for (const row of rows) {
      if (row.number === null) continue;
      counts.set(row.number, (counts.get(row.number) ?? 0) + 1);
    }
    for (const row of rows) {
      if (row.number !== null && (counts.get(row.number) ?? 0) >= 2) {
        row.voidReason = "duplicate";
        row.eligible = false;
      }
    }
  }

  const valid = rows.filter((row) => row.eligible && row.number !== null);
  if (valid.length === 0) {
    for (const row of rows) {
      row.delta = row.id === "player" && reprieveUsed === "timeout" ? 0 : -1;
    }
    return { ...finish(seats, rows, null, null, null, "none", []), reprieveUsed };
  }

  const average = valid.reduce((sum, row) => sum + (row.number as number), 0) / valid.length;
  const target = average * 0.8;
  const rounded = Math.round(target);

  let mode: "closest" | "exact" = "closest";
  let winners = valid;
  let penalty = 1;
  if (rules.exact) {
    const exactHits = valid.filter((row) => row.number === rounded);
    if (exactHits.length > 0) {
      mode = "exact";
      winners = exactHits;
      penalty = 2;
    }
  }
  if (mode !== "exact") {
    let best = Infinity;
    for (const row of valid) best = Math.min(best, Math.abs((row.number as number) - target));
    winners = valid.filter((row) => Math.abs((row.number as number) - target) === best);
    penalty = 1;
  }

  const winnerSet = new Set(winners.map((row) => row.id));
  const imprint = mods.imprint && mode === "exact" && winnerSet.has("player");
  for (const row of rows) {
    if (winnerSet.has(row.id)) row.delta = 0;
    else if (row.voidReason === "timeout") row.delta = row.id === "player" && reprieveUsed === "timeout" ? 0 : -1;
    else row.delta = imprint ? -(penalty + 1) : -penalty;
  }
  return { ...finish(seats, rows, average, target, rounded, mode, [...winnerSet]), reprieveUsed };
}

function finish(
  seats: Seat[],
  rows: RoundRow[],
  average: number | null,
  target: number | null,
  rounded: number | null,
  mode: RoundOutcome["mode"],
  winnerIds: string[],
): RoundOutcome {
  const scores: Record<string, number> = {};
  const eliminatedIds: string[] = [];
  const rowById = new Map(rows.map((row) => [row.id, row]));
  for (const seat of seats) {
    if (!seat.alive) {
      scores[seat.id] = seat.score;
      continue;
    }
    const row = rowById.get(seat.id);
    const next = seat.score + (row?.delta ?? 0);
    scores[seat.id] = next;
    if (next <= ELIMINATION_SCORE) eliminatedIds.push(seat.id);
  }
  const aliveAfter = seats.filter((seat) => seat.alive && !eliminatedIds.includes(seat.id)).map((seat) => seat.id);
  return { average, target, rounded, mode, winnerIds, rows, eliminatedIds, scores, aliveAfter };
}

export function applyOutcome(seats: Seat[], outcome: RoundOutcome): void {
  for (const seat of seats) {
    if (!seat.alive) continue;
    seat.score = outcome.scores[seat.id] ?? seat.score;
    if (outcome.eliminatedIds.includes(seat.id)) seat.alive = false;
  }
}
