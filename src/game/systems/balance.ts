import { cloneRun, createRun, playRound } from "./run";
import type { AudienceId, Decision, Run, StrategyId, Suit } from "../types";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const STRATS: StrategyId[] = ["glamour", "craft", "scandal", "borrow"];

function others(run: Run) {
  return run.roster.filter((c) => c.alive && !c.isPlayer);
}

function decide(run: Run, round: 0 | 1, mode: "read" | "bad" | "freeze"): Decision {
  if (mode === "freeze") {
    return {
      strategy: "freeze",
      audience: "freeze",
      rumorTarget: null,
      social: "abstain",
      socialTarget: null,
      timedOut: true,
    };
  }
  const player = run.roster.find((c) => c.isPlayer)!;
  const rule = round === 0 ? run.rule1 : run.ruleOT;
  const aliveOthers = others(run);
  const saint = aliveOthers.find((c) => c.personality === "saint");
  const craft = aliveOthers.find((c) => c.personality === "craft");
  const schemer = aliveOthers.find((c) => c.personality === "schemer");
  const linked = new Set(
    run.alliances.filter((p) => p.from === "player" || p.to === "player").map((p) => (p.from === "player" ? p.to : p.from)),
  );

  if (mode === "bad") {
    const target = aliveOthers[0];
    return {
      strategy: "scandal",
      audience: "rumor",
      rumorTarget: saint?.id ?? target?.id ?? null,
      social: "betray",
      socialTarget: target?.id ?? null,
      timedOut: false,
    };
  }

  let strategy: StrategyId = player.acting >= player.popularity ? "craft" : "glamour";
  if (rule.id === "public_lie") strategy = run.lieRecommend === "glamour" ? "craft" : "glamour";
  else if (rule.id === "hot_light") strategy = "glamour";
  else if (rule.id === "lens_hunger") strategy = player.acting >= player.popularity ? "craft" : "glamour";
  else if (rule.id === "dirt_window" || rule.id === "showdown_dirt") strategy = "scandal";
  else if (rule.id === "handshake" || rule.id === "chain_letter") strategy = "borrow";
  else if (rule.id === "smile_tax") strategy = player.dirt >= 36 ? "craft" : "glamour";

  let audience: AudienceId = rule.id === "silence_prize" ? "silence" : rule.id === "the_dogs" ? "bribe" : "speech";
  let social: Decision["social"] = "abstain";
  let socialTarget: string | null = null;
  const stab = [...linked].find((id) => {
    const person = aliveOthers.find((c) => c.id === id);
    return person && (person.personality === "saint" || person.personality === "schemer");
  });
  if (round === 1 && stab) {
    social = "betray";
    socialTarget = stab;
  } else if (rule.id === "handshake" || rule.id === "chain_letter" || (round === 0 && saint)) {
    social = "ally";
    socialTarget = (saint ?? craft ?? schemer ?? aliveOthers[0])?.id ?? null;
  } else if (rule.id === "blood_due" && linked.size === 0 && craft) {
    social = "ally";
    socialTarget = craft.id;
  }

  return {
    strategy,
    audience,
    rumorTarget: null,
    social,
    socialTarget,
    timedOut: false,
  };
}

function enumerate(run: Run): Decision[] {
  const targets = others(run).map((c) => c.id);
  const out: Decision[] = [];
  for (const strategy of STRATS) {
    for (const audience of ["speech", "bribe", "silence"] as AudienceId[]) {
      for (const social of ["abstain"] as const) {
        out.push({ strategy, audience, rumorTarget: null, social, socialTarget: null, timedOut: false });
      }
      for (const target of targets) {
        out.push({ strategy, audience, rumorTarget: null, social: "ally", socialTarget: target, timedOut: false });
        out.push({ strategy, audience, rumorTarget: null, social: "betray", socialTarget: target, timedOut: false });
      }
    }
    for (const rumorTarget of targets) {
      out.push({
        strategy,
        audience: "rumor",
        rumorTarget,
        social: "abstain",
        socialTarget: null,
        timedOut: false,
      });
      for (const target of targets) {
        out.push({
          strategy,
          audience: "rumor",
          rumorTarget,
          social: "ally",
          socialTarget: target,
          timedOut: false,
        });
      }
    }
  }
  return out;
}

function perfect(seed: string, suit: Suit): { r1: boolean; win: boolean } {
  const base = createRun(seed, "七号", suit);
  let r1 = false;
  for (const opening of enumerate(base)) {
    const mid = cloneRun(base);
    playRound(mid, 0, opening);
    if (mid.rounds[0].eliminated.includes("player")) continue;
    r1 = true;
    for (const closing of enumerate(mid)) {
      const fin = cloneRun(mid);
      playRound(fin, 1, closing);
      if (fin.rounds[1].winner === "player") return { r1: true, win: true };
    }
  }
  return { r1, win: false };
}

export function runBalance(): void {
  const seeds = ["VX-TEST", "VX-7K2Q", "ROSE", "灯", "AAAA", "BORDER", "19", "蜜蜡", "cold", "7777"];
  let readR1 = 0;
  let readWin = 0;
  let badR1 = 0;
  let freezeR1 = 0;
  let perfectR1 = 0;
  let perfectWin = 0;
  let samples = 0;

  const probe = createRun("VX-TEST", "七号", "diamonds");
  if (probe.rule1.id === "public_lie") {
    const obey = cloneRun(probe);
    const read = cloneRun(probe);
    const baseDecision: Decision = {
      strategy: probe.lieRecommend,
      audience: "speech",
      rumorTarget: null,
      social: "abstain",
      socialTarget: null,
      timedOut: false,
    };
    playRound(obey, 0, baseDecision);
    playRound(read, 0, { ...baseDecision, strategy: probe.lieRecommend === "glamour" ? "craft" : "glamour" });
    const gap = (read.rounds[0].scores.player?.rule ?? 0) - (obey.rounds[0].scores.player?.rule ?? 0);
    if (gap < 12) throw new Error(`public lie swing too small: ${gap}`);
  }

  for (const seed of seeds) {
    for (const suit of SUITS) {
      samples += 1;
      const read = createRun(seed, "七号", suit);
      playRound(read, 0, decide(read, 0, "read"));
      const survived = !read.rounds[0].eliminated.includes("player");
      if (survived) {
        readR1 += 1;
        playRound(read, 1, decide(read, 1, "read"));
        if (read.rounds[1].winner === "player") readWin += 1;
      }
      const bad = createRun(seed, "七号", suit);
      playRound(bad, 0, decide(bad, 0, "bad"));
      if (!bad.rounds[0].eliminated.includes("player")) badR1 += 1;
      const frozen = createRun(seed, "七号", suit);
      playRound(frozen, 0, decide(frozen, 0, "freeze"));
      if (!frozen.rounds[0].eliminated.includes("player")) freezeR1 += 1;

      const solved = perfect(seed, suit);
      if (solved.r1) perfectR1 += 1;
      if (solved.win) perfectWin += 1;
    }
  }

  const report = {
    samples,
    readR1: readR1 / samples,
    readWin: readWin / samples,
    badR1: badR1 / samples,
    freezeR1: freezeR1 / samples,
    perfectR1: perfectR1 / samples,
    perfectWin: perfectWin / samples,
  };
  console.log(JSON.stringify(report, null, 2));
  if (report.freezeR1 > 0) throw new Error("timeout survived round 1");
  if (report.readR1 < 0.7) throw new Error(`heuristic round 1 too low ${report.readR1}`);
  if (report.perfectR1 < 0.9) throw new Error(`perfect round 1 too low ${report.perfectR1}`);
  if (report.perfectWin < 0.9) throw new Error(`perfect win too low ${report.perfectWin}`);
  if (report.badR1 > 0.55) throw new Error(`bad play survives too often ${report.badR1}`);
}
