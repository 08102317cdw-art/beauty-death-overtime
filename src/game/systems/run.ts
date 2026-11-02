import { RIVALS, PLAYER_TEMPLATE, materialize, type ContestantTemplate } from "../content/roster";
import { OVERTIME_RULES, RULES, SUIT_RULES } from "../content/rules";
import { clamp, pickIndex, rngFor } from "../rng";
import type { Contestant, Decision, Run, StrategyId, Suit } from "../types";
import { decideAI } from "./ai";
import { commitRound } from "./scoring";

function jittered(template: ContestantTemplate, rng: () => number): { popularity: number; acting: number; dirt: number } {
  const swing = () => Math.floor(rng() * 7) - 3;
  return {
    popularity: clamp(template.popularity + swing(), 1, 99),
    acting: clamp(template.acting + swing(), 1, 99),
    dirt: clamp(template.dirt + swing(), 0, 99),
  };
}

function pickCast(seed: string): ContestantTemplate[] {
  const rng = rngFor(seed, "cast");
  const pool = [...RIVALS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = pool[i];
    pool[i] = pool[j];
    pool[j] = swap;
  }
  const picked: ContestantTemplate[] = [];
  for (const rival of pool) {
    if (picked.some((p) => p.personality === rival.personality)) continue;
    picked.push(rival);
    if (picked.length === 3) break;
  }
  for (const rival of pool) {
    if (picked.length === 3) break;
    if (!picked.includes(rival)) picked.push(rival);
  }
  return picked;
}

export function createRun(seed: string, playerName: string, suit: Suit): Run {
  const name = playerName.trim().slice(0, 8) || "七号";
  const statRng = rngFor(seed, "stats");
  const player = materialize(PLAYER_TEMPLATE, jittered(PLAYER_TEMPLATE, statRng), name);
  const roster: Contestant[] = [
    player,
    ...pickCast(seed).map((template) => materialize(template, jittered(template, statRng))),
  ];
  const rule1 = RULES[SUIT_RULES[suit][pickIndex(seed, "rule1", SUIT_RULES[suit].length)]];
  const overtimeId =
    rule1.id === "chain_letter"
      ? "blood_due"
      : OVERTIME_RULES[pickIndex(seed, "ruleot", OVERTIME_RULES.length)];
  const lieRecommend: StrategyId = player.popularity >= player.acting ? "craft" : "glamour";
  return {
    seed,
    playerName: name,
    suit,
    roster,
    rule1,
    ruleOT: RULES[overtimeId],
    alliances: [],
    lieRecommend,
    rounds: [],
  };
}

export function playerDecisionOrFreeze(partial: Partial<Decision>, timedOut: boolean): Decision {
  if (timedOut) {
    return {
      strategy: partial.strategy ?? "freeze",
      audience: partial.audience === "rumor" && partial.rumorTarget ? partial.audience : partial.audience && partial.audience !== "rumor" ? partial.audience : "freeze",
      rumorTarget: partial.audience === "rumor" ? partial.rumorTarget ?? null : null,
      social: partial.social ?? "abstain",
      socialTarget: partial.social && partial.social !== "abstain" ? partial.socialTarget ?? null : null,
      timedOut: true,
    };
  }
  return {
    strategy: partial.strategy ?? "freeze",
    audience: partial.audience ?? "silence",
    rumorTarget: partial.rumorTarget ?? null,
    social: partial.social ?? "abstain",
    socialTarget: partial.socialTarget ?? null,
    timedOut: false,
  };
}

export function playRound(run: Run, roundIndex: 0 | 1, player: Decision) {
  const alive = run.roster.filter((c) => c.alive);
  const decisions: Record<string, Decision> = { player };
  for (const contestant of alive) {
    if (contestant.isPlayer) continue;
    decisions[contestant.id] = decideAI(run, roundIndex, contestant, alive);
  }
  return commitRound(run, roundIndex, decisions);
}

export function cloneRun(run: Run): Run {
  return structuredClone(run);
}

export function contestantById(run: Run, id: string): Contestant | undefined {
  return run.roster.find((c) => c.id === id);
}
