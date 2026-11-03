export type Hair = "bob" | "long" | "updo" | "veil" | "crop" | "wave";
export type Mark = "mole" | "earring" | "tear" | "scar" | "none";

export interface Look {
  hair: Hair;
  mark: Mark;
  hairColor: string;
  lip: string;
  wash: string;
  metal: string;
  smile: boolean;
  coverEye: boolean;
}

export type Role = "player" | "king" | "rational" | "deep" | "chaos";

export interface Seat {
  id: string;
  name: string;
  epithet: string;
  role: Role;
  depth: 0 | 1 | 2 | 3;
  bio: string;
  look: Look;
  score: number;
  alive: boolean;
}

export type SceneId = "title" | "seat" | "tablet" | "decree" | "choose" | "verdict" | "ending";

export type ClauseId = "duplicate" | "exact" | "duel";

export interface Submitted {
  id: string;
  /** null means the number was voided by timeout. */
  number: number | null;
}

export type VoidReason = "timeout" | "duplicate" | null;

export interface RoundRow {
  id: string;
  number: number | null;
  voidReason: VoidReason;
  delta: number;
  eligible: boolean;
}

export type RoundMode = "closest" | "exact" | "duel" | "none";

export interface RoundOutcome {
  average: number | null;
  target: number | null;
  rounded: number | null;
  mode: RoundMode;
  winnerIds: string[];
  rows: RoundRow[];
  eliminatedIds: string[];
  scores: Record<string, number>;
  aliveAfter: string[];
}

export interface Ending {
  win: boolean;
  name: string;
  seed: string;
}
