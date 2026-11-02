import type { Pact } from "../types";

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function partnersOf(id: string, pacts: Pact[]): string[] {
  const set = new Set<string>();
  for (const pact of pacts) {
    if (pact.from === id) set.add(pact.to);
    if (pact.to === id) set.add(pact.from);
  }
  return [...set];
}

export function isMutual(a: string, b: string, pacts: Pact[]): boolean {
  return (
    pacts.some((p) => p.from === a && p.to === b) &&
    pacts.some((p) => p.from === b && p.to === a)
  );
}

export function hasOutgoing(id: string, pacts: Pact[]): boolean {
  return pacts.some((p) => p.from === id);
}

export function hasLink(id: string, pacts: Pact[]): boolean {
  return pacts.some((p) => p.from === id || p.to === id);
}
