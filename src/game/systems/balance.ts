import { createSeats } from "../content/cast";
import type { ClauseId, Seat, Submitted } from "../types";
import {
  aiNumber,
  applyOutcome,
  converge,
  DIGEST_SECONDS,
  resolveRound,
  TURN_SECONDS,
  unlockedClauses,
  withoutBlame,
} from "./contest";

function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}

function seatsOf(numbers: Array<[string, number | null]>): { seats: Seat[]; submitted: Submitted[] } {
  const seats = createSeats("七号").slice(0, numbers.length);
  // Rebind ids to the provided order while keeping roles off; tests pass explicit ids.
  const custom: Seat[] = numbers.map(([id], index) => ({
    ...(seats[index] ?? seats[0]),
    id,
    score: 0,
    alive: true,
  }));
  return {
    seats: custom,
    submitted: numbers.map(([id, number]) => ({ id, number })),
  };
}

function checkFixedRounds(): void {
  assert(converge(0) === 50, "depth 0");
  assert(converge(1) === 40, "depth 1");
  assert(converge(2) === 32, "depth 2");
  assert(converge(3) === 26, "depth 3");
  assert(withoutBlame(1, true) === 0, "king refuses 1");
  assert(withoutBlame(100, true) === 0, "king refuses 100");
  assert(withoutBlame(32, true) === 32, "king keeps an honest number");
  assert(DIGEST_SECONDS === 300 && TURN_SECONDS === 60, "timers");

  const basic = seatsOf([
    ["a", 0],
    ["b", 20],
    ["c", 40],
    ["d", 60],
    ["e", 80],
  ]);
  const basicOut = resolveRound(basic.seats, basic.submitted, 0);
  assert(basicOut.average === 40, `avg ${basicOut.average}`);
  assert(basicOut.target === 32, `target ${basicOut.target}`);
  assert(basicOut.winnerIds.join() === "c", "closest is 40");
  assert(basicOut.rows.find((row) => row.id === "c")?.delta === 0, "winner holds");
  assert(basicOut.rows.find((row) => row.id === "a")?.delta === -1, "loser -1");

  const dup = seatsOf([
    ["a", 40],
    ["b", 40],
    ["c", 10],
    ["d", 20],
    ["e", 30],
  ]);
  const dupOut = resolveRound(dup.seats, dup.submitted, 1);
  assert(dupOut.rows.filter((row) => row.voidReason === "duplicate").length === 2, "pair void");
  assert(dupOut.average === 20, `dup avg ${dupOut.average}`);
  assert(dupOut.target === 16, `dup target ${dupOut.target}`);
  assert(dupOut.winnerIds.join() === "d", "20 is closest to 16");
  assert(dupOut.rows.find((row) => row.id === "a")?.delta === -1, "invalid still loses");

  const exact = seatsOf([
    ["a", 20],
    ["b", 30],
    ["c", 24],
  ]);
  const exactOut = resolveRound(exact.seats, exact.submitted, 2);
  assert(exactOut.rounded === 20, `rounded ${exactOut.rounded} target ${exactOut.target}`);
  assert(exactOut.mode === "exact", "exact mode");
  assert(exactOut.winnerIds.join() === "a", "20 hits");
  assert(exactOut.rows.find((row) => row.id === "b")?.delta === -2, "others -2");

  const timeout = seatsOf([
    ["a", null],
    ["b", 20],
    ["c", 30],
    ["d", 24],
  ]);
  const timeoutOut = resolveRound(timeout.seats, timeout.submitted, 2);
  assert(timeoutOut.rows.find((row) => row.id === "a")?.delta === -1, "timeout stays -1 on an exact round");
  assert(timeoutOut.rows.find((row) => row.id === "a")?.voidReason === "timeout", "void");
  assert(!timeoutOut.rows.find((row) => row.id === "a")?.eligible, "timeout out of average");

  const duel = seatsOf([
    ["a", 0],
    ["b", 100],
  ]);
  const duelOut = resolveRound(duel.seats, duel.submitted, 3);
  assert(duelOut.mode === "duel", "duel rule");
  assert(duelOut.winnerIds.join() === "b", "100 wins");
  assert(duelOut.rows.find((row) => row.id === "a")?.delta === -1, "zero loses the duel");
  assert(duelOut.average === null, "duel skips the average");

  const low = createSeats("七号");
  low.forEach((seat) => {
    seat.score = seat.id === "player" ? -9 : 0;
  });
  const drop = resolveRound(
    low,
    low.map((seat) => ({ id: seat.id, number: seat.id === "player" ? 0 : 100 })),
    0,
  );
  assert(drop.rows.find((row) => row.id === "player")?.delta === -1, "player should lose this constructed round");
  assert(drop.eliminatedIds.includes("player"), "−10 eliminates");
}

function bestNumber(seats: Seat[], known: Submitted[], eliminated: number): number {
  let bestN = 0;
  let bestScore = -Infinity;
  for (let n = 0; n <= 100; n++) {
    const outcome = resolveRound(seats, [...known, { id: "player", number: n }], eliminated);
    const mine = outcome.rows.find((row) => row.id === "player");
    if (!mine) continue;
    const dead = outcome.eliminatedIds.includes("player");
    const hurt = outcome.rows.filter((row) => row.id !== "player").reduce((sum, row) => sum + -Math.min(0, row.delta), 0);
    const eliminatedOthers = outcome.eliminatedIds.filter((id) => id !== "player").length;
    const score = (dead ? -1000 : 0) + mine.delta * 30 + eliminatedOthers * 20 + hurt;
    if (score > bestScore) {
      bestScore = score;
      bestN = n;
    }
  }
  return bestN;
}

function playSeed(seed: string, perfect: boolean): { win: boolean; saw: ClauseId[]; rounds: number; playerScore: number } {
  const seats = createSeats("七号");
  let eliminated = 0;
  const saw = new Set<ClauseId>();
  let rounds = 0;
  while (rounds < 60) {
    const alive = seats.filter((seat) => seat.alive);
    const player = alive.find((seat) => seat.id === "player");
    if (!player) return { win: false, saw: [...saw], rounds, playerScore: seats.find((s) => s.id === "player")?.score ?? -99 };
    if (alive.length === 1) return { win: true, saw: [...saw], rounds, playerScore: player.score };
    const duel = eliminated >= 3 && alive.length === 2;
    const actual = alive
      .filter((seat) => seat.role !== "player")
      .map((seat) => ({ id: seat.id, number: aiNumber(seat.role, seed, rounds + 1, duel) }));
    const assumed = alive
      .filter((seat) => seat.role !== "player")
      .map((seat) => ({
        id: seat.id,
        number: seat.role === "chaos" && !perfect ? 50 : aiNumber(seat.role, seed, rounds + 1, duel),
      }));
    const choice = bestNumber(seats, perfect ? actual : assumed, eliminated);
    const before = eliminated;
    const outcome = resolveRound(seats, [...actual, { id: "player", number: choice }], eliminated);
    applyOutcome(seats, outcome);
    eliminated = seats.filter((seat) => !seat.alive).length;
    for (const clause of unlockedClauses(before, eliminated)) saw.add(clause);
    rounds += 1;
  }
  const playerScore = seats.find((seat) => seat.id === "player")?.score ?? -99;
  const win = seats.filter((seat) => seat.alive).every((seat) => seat.id === "player") && seats.some((seat) => seat.id === "player" && seat.alive);
  return { win, saw: [...saw], rounds, playerScore };
}

export function runBalance(): void {
  checkFixedRounds();
  const seeds = ["VX-TEST", "ROSE", "AAAA", "灯", "BORDER", "19", "KING", "7777"];
  let steadyWins = 0;
  let steadySawDuel = 0;
  let perfectWins = 0;
  for (const seed of seeds) {
    const steady = playSeed(seed, false);
    const perfect = playSeed(seed, true);
    if (steady.win) steadyWins += 1;
    if (steady.saw.includes("duel") || steady.saw.includes("duplicate")) steadySawDuel += 1;
    if (perfect.win) perfectWins += 1;
    const again = playSeed(seed, false);
    assert(JSON.stringify(steady) === JSON.stringify(again), `seed drifted ${seed}`);
    console.log(seed, "steady", steady.win, steady.playerScore, steady.saw.join("+") || "-", "perfect", perfect.win, perfect.playerScore);
  }
  assert(perfectWins === seeds.length, `perfect clears ${perfectWins}/${seeds.length}`);
  assert(steadyWins >= Math.ceil(seeds.length * 0.6), `steady clears ${steadyWins}/${seeds.length}`);
  assert(steadySawDuel >= 4, `rules rarely appear ${steadySawDuel}`);
  console.log(JSON.stringify({ seeds: seeds.length, steadyWins, perfectWins, steadySawDuel }));
}
