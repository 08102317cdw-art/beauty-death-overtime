import { hashSeed } from "../rng";
import type {
  Contestant,
  Decision,
  Pact,
  RoundRecord,
  RuleCard,
  Run,
  ScoreBreakdown,
  StrategyId,
  Suit,
} from "../types";
import { hasOutgoing, isMutual, pairKey, partnersOf } from "./pacts";

export const SCORE = {
  glamour: 14,
  glamourPeak: 6,
  glamourPeakAt: 75,
  craft: 14,
  craftPeak: 6,
  craftPeakAt: 75,
  scandalFail: -6,
  scandalMidBase: 6,
  scandalMidStep: 0.25,
  scandalHigh: 12,
  scandalMidAt: 18,
  scandalHighAt: 30,
  borrowMutual: 16,
  borrowOut: 12,
  borrowIn: 5,
  borrowNone: -8,
  speechBase: 8,
  speechPop: 0.06,
  bribe: 16,
  bribeDirt: 6,
  silence: 4,
  silenceCraft: 4,
  silenceCraftAt: 75,
  silencePrize: 14,
  rumorVictim: -9,
  rumorAttack: 5,
  rumorBacklash: -11,
  rumorSoft: -3,
  rumorDirt: 8,
  rumorBullyDirt: 4,
  cleanDirt: 10,
  allyMutual: 10,
  allyOut: 5,
  allyCut: -4,
  betrayReal: 18,
  betrayClumsy: -8,
  betrayVictim: -14,
  betrayChip: -4,
  betrayDirt: 8,
  abstain: 3,
  timeout1: 20,
  timeout2: 24,
  timeoutClock: 42,
  handshakeCut: 0.25,
  handshakeMutual: 10,
  handshakeOut: 6,
  chainMutual: 12,
  smileFlat: 10,
  smileDirt: 0.28,
  lensPenalty: 10,
  hotFlat: 12,
  hotPeak: 6,
  hotPeakAt: 72,
  hotHangover: 8,
  dirtWindow: 14,
  dirtWindowClean: 6,
  dirtWindowReduce: 12,
  dirtWindowRumor: -14,
  lieObey: -8,
  lieRead: 10,
  showdownWeapon: 0.4,
  showdownPenalty: 0.45,
  bloodExtra: 10,
  bloodLoyal: 8,
};

export function weights(suit: Suit, roundIndex: 0 | 1): { wP: number; wA: number } {
  if (roundIndex === 1) return { wP: 0.22, wA: 0.22 };
  switch (suit) {
    case "spades":
      return { wP: 0.16, wA: 0.4 };
    case "hearts":
      return { wP: 0.36, wA: 0.18 };
    case "diamonds":
      return { wP: 0.24, wA: 0.32 };
    case "clubs":
      return { wP: 0.22, wA: 0.22 };
  }
}

export function roundSeconds(roundIndex: 0 | 1, ruleId: RuleCard["id"]): number {
  if (roundIndex === 0) return 56;
  if (ruleId === "epitaph_clock") return 32;
  return 38;
}

interface SocialOutcome {
  nextPacts: Pact[];
  realBetray: Set<string>;
  realVictim: Set<string>;
  clumsyVictim: Set<string>;
}

export function resolveSocial(
  prior: Pact[],
  decisions: Record<string, Decision>,
  aliveIds: string[],
): SocialOutcome {
  const alive = new Set(aliveIds);
  const offered: Pact[] = prior.filter((p) => alive.has(p.from) && alive.has(p.to));
  for (const [id, decision] of Object.entries(decisions)) {
    if (
      decision.social === "ally" &&
      decision.socialTarget &&
      decision.socialTarget !== id &&
      alive.has(decision.socialTarget)
    ) {
      offered.push({ from: id, to: decision.socialTarget });
    }
  }

  const linked = (a: string, b: string) =>
    offered.some((p) => (p.from === a && p.to === b) || (p.from === b && p.to === a));

  const realBetray = new Set<string>();
  const realVictim = new Set<string>();
  const clumsyVictim = new Set<string>();
  const blocked = new Set<string>();

  for (const [id, decision] of Object.entries(decisions)) {
    if (decision.social !== "betray" || !decision.socialTarget) continue;
    const target = decision.socialTarget;
    if (!alive.has(target) || target === id) continue;
    if (linked(id, target)) {
      realBetray.add(id);
      realVictim.add(target);
      blocked.add(pairKey(id, target));
    } else {
      clumsyVictim.add(target);
    }
  }

  const nextPacts: Pact[] = [];
  const seen = new Set<string>();
  for (const pact of offered) {
    if (blocked.has(pairKey(pact.from, pact.to))) continue;
    const key = `${pact.from}>${pact.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    nextPacts.push(pact);
  }

  return { nextPacts, realBetray, realVictim, clumsyVictim };
}

function scandalValue(dirt: number): number {
  if (dirt < SCORE.scandalMidAt) return SCORE.scandalFail;
  if (dirt < SCORE.scandalHighAt) {
    return SCORE.scandalMidBase + (dirt - SCORE.scandalMidAt) * SCORE.scandalMidStep;
  }
  return SCORE.scandalHigh;
}

function strategyValue(
  person: Contestant,
  decision: Decision,
  pacts: Pact[],
): { value: number; tags: string[] } {
  if (decision.strategy === "freeze" || decision.timedOut) return { value: 0, tags: [] };
  const tags: string[] = [];
  switch (decision.strategy) {
    case "glamour": {
      const peak = person.popularity >= SCORE.glamourPeakAt ? SCORE.glamourPeak : 0;
      return { value: SCORE.glamour + peak, tags };
    }
    case "craft": {
      const peak = person.acting >= SCORE.craftPeakAt ? SCORE.craftPeak : 0;
      return { value: SCORE.craft + peak, tags };
    }
    case "scandal": {
      const value = scandalValue(person.dirt);
      if (value < 0) tags.push("scandal");
      return { value, tags };
    }
    case "borrow": {
      const partners = partnersOf(person.id, pacts);
      if (partners.length === 0) return { value: SCORE.borrowNone, tags };
      let best = SCORE.borrowNone;
      for (const other of partners) {
        if (isMutual(person.id, other, pacts)) best = Math.max(best, SCORE.borrowMutual);
        else if (pacts.some((p) => p.from === person.id && p.to === other)) {
          best = Math.max(best, SCORE.borrowOut);
        } else best = Math.max(best, SCORE.borrowIn);
      }
      return { value: best, tags };
    }
    default:
      return { value: 0, tags };
  }
}

function audienceBase(person: Contestant, decision: Decision, rule: RuleCard): number {
  if (decision.audience === "freeze" || decision.timedOut) return 0;
  switch (decision.audience) {
    case "speech":
      return SCORE.speechBase + person.popularity * SCORE.speechPop;
    case "bribe":
      return SCORE.bribe;
    case "silence": {
      let value = SCORE.silence;
      if (person.acting >= SCORE.silenceCraftAt) value += SCORE.silenceCraft;
      if (rule.id === "silence_prize") value += SCORE.silencePrize;
      return value;
    }
    case "rumor":
      return 0;
    default:
      return 0;
  }
}

function socialValue(
  person: Contestant,
  decision: Decision,
  outcome: SocialOutcome,
): number {
  let value = 0;
  if (!decision.timedOut) {
    if (decision.social === "abstain" || !decision.socialTarget) value += SCORE.abstain;
    else if (decision.social === "ally") {
      const target = decision.socialTarget;
      const kept = outcome.nextPacts.some((p) => p.from === person.id && p.to === target);
      if (!kept) value += SCORE.allyCut;
      else if (isMutual(person.id, target, outcome.nextPacts)) value += SCORE.allyMutual;
      else value += SCORE.allyOut;
    } else if (decision.social === "betray") {
      value += outcome.realBetray.has(person.id) ? SCORE.betrayReal : SCORE.betrayClumsy;
    }
  }
  if (outcome.realVictim.has(person.id)) value += SCORE.betrayVictim;
  else if (outcome.clumsyVictim.has(person.id)) value += SCORE.betrayChip;
  return value;
}

interface FloatParts {
  base: number;
  strategy: number;
  audience: number;
  social: number;
  rule: number;
  penalty: number;
  jitter: number;
  tags: string[];
}

function emptyParts(): FloatParts {
  return { base: 0, strategy: 0, audience: 0, social: 0, rule: 0, penalty: 0, jitter: 0, tags: [] };
}

function applyRules(
  run: Run,
  roundIndex: 0 | 1,
  rule: RuleCard,
  person: Contestant,
  decision: Decision,
  parts: FloatParts,
  pacts: Pact[],
  weightsNow: { wP: number; wA: number },
): void {
  const { tags } = parts;
  if (rule.id === "lens_hunger" && decision.strategy !== "glamour" && decision.strategy !== "craft") {
    parts.rule -= SCORE.lensPenalty + person.popularity * weightsNow.wP;
    tags.push("empty_frame");
  }
  if (rule.id === "hot_light" && decision.strategy === "glamour") {
    parts.rule += SCORE.hotFlat;
    if (person.popularity >= SCORE.hotPeakAt) parts.rule += SCORE.hotPeak;
  }
  if (person.overexposed && roundIndex === 1) {
    parts.rule -= SCORE.hotHangover;
    tags.push("overexposed");
  }
  if (rule.id === "smile_tax" && decision.strategy === "glamour") {
    parts.rule += SCORE.smileFlat - person.dirt * SCORE.smileDirt;
  }
  if (rule.id === "dirt_window" && decision.strategy === "scandal") {
    parts.rule += SCORE.dirtWindow;
    if (person.dirt >= SCORE.scandalMidAt) parts.rule += SCORE.dirtWindowClean;
  }
  if (rule.id === "public_lie" && person.isPlayer && !decision.timedOut) {
    const opposite: StrategyId = run.lieRecommend === "glamour" ? "craft" : "glamour";
    if (decision.strategy === run.lieRecommend) {
      parts.rule += SCORE.lieObey;
      tags.push("obedient");
    } else if (decision.strategy === opposite) {
      parts.rule += SCORE.lieRead;
      tags.push("reader");
    }
  }
  if (rule.id === "handshake" && !decision.timedOut) {
    if (partnersOf(person.id, pacts).some((other) => isMutual(person.id, other, pacts))) {
      parts.rule += SCORE.handshakeMutual;
    } else if (hasOutgoing(person.id, pacts)) {
      parts.rule += SCORE.handshakeOut;
    }
  }
  if (rule.id === "chain_letter") {
    if (partnersOf(person.id, pacts).some((other) => isMutual(person.id, other, pacts))) {
      parts.rule += SCORE.chainMutual;
    }
  }
  if (rule.id === "showdown_dirt") {
    if (decision.strategy === "scandal") parts.rule += person.dirt * SCORE.showdownWeapon;
    else parts.rule -= person.dirt * SCORE.showdownPenalty;
  }
  if (rule.id === "blood_due") {
    const mutuals = partnersOf(person.id, run.alliances).filter((other) =>
      isMutual(person.id, other, run.alliances),
    );
    const betrayedMutual =
      decision.social === "betray" &&
      decision.socialTarget !== null &&
      mutuals.includes(decision.socialTarget);
    if (betrayedMutual) parts.rule += SCORE.bloodExtra;
    else if (mutuals.length > 0 && decision.social !== "betray") parts.rule += SCORE.bloodLoyal;
  }
  if (rule.id === "the_dogs") parts.audience *= 2;
}

function applyRumors(
  parts: Map<string, FloatParts>,
  decisions: Record<string, Decision>,
  roster: Contestant[],
  rule: RuleCard,
): void {
  const dog = rule.id === "the_dogs" ? 2 : 1;
  const byId = new Map(roster.map((c) => [c.id, c]));
  for (const [id, decision] of Object.entries(decisions)) {
    if (decision.audience !== "rumor" || !decision.rumorTarget || decision.timedOut) continue;
    const attacker = byId.get(id);
    const victim = byId.get(decision.rumorTarget);
    const aParts = parts.get(id);
    const vParts = parts.get(decision.rumorTarget);
    if (!attacker || !victim || !aParts || !vParts || attacker.id === victim.id) continue;
    const clean = victim.dirt < SCORE.cleanDirt || victim.personality === "saint";
    if (clean) {
      aParts.audience += SCORE.rumorBacklash * dog;
      vParts.audience += SCORE.rumorSoft * dog;
      aParts.tags.push("cheap_shot");
    } else {
      aParts.audience += SCORE.rumorAttack * dog;
      vParts.audience += SCORE.rumorVictim * dog;
    }
  }
}

function finalize(parts: FloatParts, person: Contestant, decision: Decision, rule: RuleCard, pacts: Pact[]): ScoreBreakdown {
  if (rule.id === "handshake" && !hasOutgoing(person.id, pacts)) {
    const sub =
      parts.base + parts.strategy + parts.audience + parts.social + parts.rule + parts.jitter - parts.penalty;
    const cut = Math.max(0, sub) * SCORE.handshakeCut;
    parts.rule -= cut;
    parts.tags.push("unheld");
  }
  const roundNum = (n: number) => Math.round(n);
  const base = roundNum(parts.base);
  const strategy = roundNum(parts.strategy);
  const audience = roundNum(parts.audience);
  const social = roundNum(parts.social);
  const ruleScore = roundNum(parts.rule);
  const penalty = roundNum(parts.penalty);
  const jitter = roundNum(parts.jitter);
  const total = base + strategy + audience + social + ruleScore - penalty + jitter;
  return {
    id: person.id,
    base,
    strategy,
    audience,
    social,
    rule: ruleScore,
    penalty,
    jitter,
    total,
    tags: [...new Set(parts.tags)],
    timedOut: decision.timedOut,
  };
}

function compareRanking(
  a: Contestant,
  b: Contestant,
  scores: Record<string, ScoreBreakdown>,
  seed: string,
): number {
  const sa = scores[a.id];
  const sb = scores[b.id];
  if (sa.timedOut !== sb.timedOut) return sa.timedOut ? 1 : -1;
  if (sa.total !== sb.total) return sb.total - sa.total;
  if (a.dirt !== b.dirt) return a.dirt - b.dirt;
  return hashSeed(`${seed}:tie:${a.id}`) - hashSeed(`${seed}:tie:${b.id}`);
}

export function scoreRound(run: Run, roundIndex: 0 | 1, decisions: Record<string, Decision>): {
  scores: Record<string, ScoreBreakdown>;
  ranking: string[];
  nextPacts: Pact[];
  outcome: SocialOutcome;
} {
  const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
  const alive = run.roster.filter((c) => c.alive);
  const aliveIds = alive.map((c) => c.id);
  const outcome = resolveSocial(run.alliances, decisions, aliveIds);
  const w = weights(run.suit, roundIndex);
  const parts = new Map<string, FloatParts>();

  for (const person of alive) {
    const decision = decisions[person.id];
    const row = emptyParts();
    row.base = person.popularity * w.wP + person.acting * w.wA;
    const strat = strategyValue(person, decision, outcome.nextPacts);
    row.strategy = strat.value;
    row.tags.push(...strat.tags);
    row.audience = audienceBase(person, decision, rule);
    row.social = socialValue(person, decision, outcome);
    row.penalty = decision.timedOut
      ? rule.id === "epitaph_clock"
        ? SCORE.timeoutClock
        : roundIndex === 1
          ? SCORE.timeout2
          : SCORE.timeout1
      : 0;
    row.jitter = (hashSeed(`${run.seed}:${roundIndex}:${person.id}`) % 5) - 2;
    if (decision.timedOut) row.tags.push("timeout");
    if (outcome.realVictim.has(person.id)) row.tags.push("betrayed");
    if (outcome.realBetray.has(person.id)) row.tags.push("murder");
    if (decision.audience === "silence") row.tags.push("silence");
    applyRules(run, roundIndex, rule, person, decision, row, outcome.nextPacts, w);
    parts.set(person.id, row);
  }

  applyRumors(parts, decisions, alive, rule);

  const rumored = new Set<string>();
  for (const decision of Object.values(decisions)) {
    if (decision.audience === "rumor" && decision.rumorTarget && !decision.timedOut) {
      rumored.add(decision.rumorTarget);
    }
  }
  if (rule.id === "dirt_window") {
    for (const person of alive) {
      const decision = decisions[person.id];
      if (decision.strategy === "scandal" && rumored.has(person.id)) {
        const row = parts.get(person.id);
        if (row) row.rule -= SCORE.dirtWindowRumor;
      }
    }
  }

  const scores: Record<string, ScoreBreakdown> = {};
  for (const person of alive) {
    scores[person.id] = finalize(parts.get(person.id) ?? emptyParts(), person, decisions[person.id], rule, outcome.nextPacts);
  }
  const ranking = [...alive]
    .sort((a, b) => compareRanking(a, b, scores, run.seed))
    .map((c) => c.id);
  return { scores, ranking, nextPacts: outcome.nextPacts, outcome };
}

export function commitRound(run: Run, roundIndex: 0 | 1, decisions: Record<string, Decision>): RoundRecord {
  const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
  const scored = scoreRound(run, roundIndex, decisions);
  const eliminated = roundIndex === 0 ? [scored.ranking[scored.ranking.length - 1]] : scored.ranking.slice(1);
  const winner = roundIndex === 1 ? scored.ranking[0] : null;

  const rumoredBy = new Map<string, string[]>();
  for (const [id, decision] of Object.entries(decisions)) {
    if (decision.audience !== "rumor" || !decision.rumorTarget || decision.timedOut) continue;
    const list = rumoredBy.get(decision.rumorTarget) ?? [];
    list.push(id);
    rumoredBy.set(decision.rumorTarget, list);
  }

  for (const person of run.roster) {
    if (!person.alive) continue;
    const decision = decisions[person.id];
    if (!decision) continue;
    if (decision.audience === "bribe" && !decision.timedOut) person.dirt += SCORE.bribeDirt;
    if (rule.id === "hot_light" && decision.strategy === "glamour" && person.popularity >= SCORE.hotPeakAt) {
      person.overexposed = true;
    }
    if (rule.id === "dirt_window" && decision.strategy === "scandal" && person.dirt >= SCORE.scandalMidAt) {
      person.dirt = Math.max(0, person.dirt - SCORE.dirtWindowReduce);
    }
    if (scored.outcome.realBetray.has(person.id)) person.dirt += SCORE.betrayDirt;
    if (scored.scores[person.id]?.tags.includes("cheap_shot")) person.dirt += SCORE.rumorBullyDirt;
    const attackers = rumoredBy.get(person.id) ?? [];
    if (attackers.length > 0) person.dirt += SCORE.rumorDirt;
  }

  for (const id of eliminated) {
    const person = run.roster.find((c) => c.id === id);
    if (person) person.alive = false;
  }

  run.alliances = scored.nextPacts.filter(
    (p) => run.roster.find((c) => c.id === p.from)?.alive && run.roster.find((c) => c.id === p.to)?.alive,
  );

  const record: RoundRecord = {
    index: roundIndex,
    ruleId: rule.id,
    decisions,
    scores: scored.scores,
    ranking: scored.ranking,
    eliminated,
    winner,
  };
  run.rounds[roundIndex] = record;
  return record;
}

export function threatScore(person: Contestant, suit: Suit, roundIndex: 0 | 1): number {
  const w = weights(suit, roundIndex);
  return person.popularity * w.wP + person.acting * w.wA;
}
