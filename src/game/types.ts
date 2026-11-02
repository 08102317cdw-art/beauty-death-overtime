export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export type Personality = "clout" | "craft" | "schemer" | "saint";

export type SceneId =
  | "title"
  | "visa"
  | "briefing"
  | "round"
  | "resolution"
  | "ending";

export type StrategyId = "glamour" | "craft" | "scandal" | "borrow";

export type AudienceId = "speech" | "bribe" | "rumor" | "silence";

export type SocialKind = "ally" | "betray" | "abstain";

export type Hair = "bob" | "long" | "updo" | "veil" | "crop" | "wave";

export type Mark = "mole" | "earring" | "tear" | "scar" | "none";

export type RuleId =
  | "lens_hunger"
  | "hot_light"
  | "smile_tax"
  | "dirt_window"
  | "public_lie"
  | "silence_prize"
  | "handshake"
  | "chain_letter"
  | "showdown_dirt"
  | "the_dogs"
  | "epitaph_clock"
  | "blood_due";

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

export interface Contestant {
  id: string;
  name: string;
  epithet: string;
  bio: string;
  personality: Personality;
  personalityLabel: string;
  look: Look;
  isPlayer: boolean;
  popularity: number;
  acting: number;
  dirt: number;
  alive: boolean;
  overexposed: boolean;
}

export interface Pact {
  from: string;
  to: string;
}

export interface Decision {
  strategy: StrategyId | "freeze";
  audience: AudienceId | "freeze";
  rumorTarget: string | null;
  social: SocialKind;
  socialTarget: string | null;
  timedOut: boolean;
}

export interface RuleCard {
  id: RuleId;
  name: string;
  suit: Suit | "overtime";
  kicker: string;
  text: string;
  plain: string;
}

export interface ScoreBreakdown {
  id: string;
  base: number;
  strategy: number;
  audience: number;
  social: number;
  rule: number;
  penalty: number;
  jitter: number;
  total: number;
  tags: string[];
  timedOut: boolean;
}

export interface RoundRecord {
  index: 0 | 1;
  ruleId: RuleId;
  decisions: Record<string, Decision>;
  scores: Record<string, ScoreBreakdown>;
  ranking: string[];
  eliminated: string[];
  winner: string | null;
}

export interface Run {
  seed: string;
  playerName: string;
  suit: Suit;
  roster: Contestant[];
  rule1: RuleCard;
  ruleOT: RuleCard;
  alliances: Pact[];
  lieRecommend: StrategyId;
  rounds: RoundRecord[];
}

export interface Ending {
  win: boolean;
  title: string;
  epitaph: string;
  body: string;
  placeLabel: string;
  suit: Suit;
  seed: string;
  name: string;
}

export interface GameState {
  scene: SceneId;
  seed: string;
  playerName: string;
  suit: Suit | null;
  run: Run | null;
  briefingRound: 0 | 1;
  beat: 0 | 1 | 2;
  pickingRumor: boolean;
  socialMode: "ally" | "betray";
  pending: Partial<Decision>;
  timerLeft: number;
  timerMax: number;
  resolutionRound: 0 | 1 | null;
  ending: Ending | null;
  lastRunLine: string;
}

export interface GameController {
  state: GameState;
  muted: boolean;
  setSeed(seed: string): void;
  setName(name: string): void;
  randomizeSeed(): void;
  goVisa(): void;
  chooseSuit(suit: Suit): void;
  beginRound(): void;
  pickStrategy(id: StrategyId): void;
  pickAudience(id: AudienceId): void;
  pickRumor(id: string): void;
  cancelRumor(): void;
  setSocialMode(mode: "ally" | "betray"): void;
  pickSocialTarget(id: string): void;
  pickAbstain(): void;
  continueAfterResolution(): void;
  retrySame(): void;
  backToTitle(): void;
  toggleMute(): void;
}
