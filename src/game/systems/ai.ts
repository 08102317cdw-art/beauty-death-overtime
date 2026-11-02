import type { Contestant, Decision, Run } from "../types";
import { isMutual, partnersOf } from "./pacts";
import { threatScore } from "./scoring";

function abstain(strategy: Decision["strategy"], audience: Decision["audience"], rumorTarget: string | null = null): Decision {
  return {
    strategy,
    audience,
    rumorTarget,
    social: "abstain",
    socialTarget: null,
    timedOut: false,
  };
}

function strongest(people: Contestant[], run: Run, roundIndex: 0 | 1): Contestant | null {
  if (people.length === 0) return null;
  return [...people].sort((a, b) => {
    const diff = threatScore(b, run.suit, roundIndex) - threatScore(a, run.suit, roundIndex);
    if (Math.abs(diff) > 1e-6) return diff;
    return a.id < b.id ? -1 : 1;
  })[0];
}

function weakest(people: Contestant[]): Contestant | null {
  if (people.length === 0) return null;
  return [...people].sort((a, b) => {
    if (a.popularity !== b.popularity) return a.popularity - b.popularity;
    return a.id < b.id ? -1 : 1;
  })[0];
}

export function decideAI(run: Run, roundIndex: 0 | 1, self: Contestant, alive: Contestant[]): Decision {
  const others = alive.filter((c) => c.id !== self.id);
  const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
  const player = others.find((c) => c.isPlayer) ?? null;
  const priorPartners = partnersOf(self.id, run.alliances).filter((id) => others.some((c) => c.id === id));
  const partnerPeople = others.filter((c) => priorPartners.includes(c.id));

  const rumorTarget = strongest(others, run, roundIndex);

  if (self.personality === "clout") {
    return abstain("glamour", "bribe");
  }

  if (self.personality === "craft") {
    const audience = rule.id === "silence_prize" ? "silence" : "speech";
    return abstain("craft", audience);
  }

  if (self.personality === "schemer") {
    const strategy =
      rule.id === "showdown_dirt" || rule.id === "dirt_window" || self.dirt >= 30 ? "scandal" : "craft";
    const audience = "rumor" as const;
    const target = rumorTarget?.id ?? null;
    if (partnerPeople.length > 0) {
      const mark = strongest(partnerPeople, run, roundIndex) ?? partnerPeople[0];
      return {
        strategy,
        audience,
        rumorTarget: target,
        social: "betray",
        socialTarget: mark.id,
        timedOut: false,
      };
    }
    return abstain(strategy, audience, target);
  }

  const clubs = rule.id === "handshake" || rule.id === "chain_letter";
  if (roundIndex === 1 && partnerPeople.length > 0) {
    const prefersPlayer = player && priorPartners.includes(player.id) ? player : null;
    const mark = prefersPlayer ?? strongest(partnerPeople, run, roundIndex) ?? partnerPeople[0];
    const strategy = self.acting >= self.popularity ? "craft" : "glamour";
    return {
      strategy,
      audience: "speech",
      rumorTarget: null,
      social: "betray",
      socialTarget: mark.id,
      timedOut: false,
    };
  }

  let strategy: Decision["strategy"] = "glamour";
  if (clubs) strategy = "borrow";
  else if (self.acting >= self.popularity + 8) strategy = "craft";

  const allyTarget = clubs && player ? player : weakest(others);
  if (!allyTarget) return abstain(strategy, "speech");
  const already = isMutual(self.id, allyTarget.id, run.alliances);
  if (already && !clubs) return abstain(strategy, "speech");
  return {
    strategy,
    audience: "speech",
    rumorTarget: null,
    social: "ally",
    socialTarget: allyTarget.id,
    timedOut: false,
  };
}
