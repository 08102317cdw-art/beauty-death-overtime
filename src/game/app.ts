import { AudioDirector } from "./audio";
import { buildEnding } from "./content/epitaphs";
import { renderBriefing } from "./scenes/briefing";
import { renderEnding } from "./scenes/ending";
import { renderResolution } from "./scenes/resolution";
import { renderRound } from "./scenes/round";
import { renderTitle } from "./scenes/title";
import { renderVisa } from "./scenes/visa";
import { randomSeed } from "./rng";
import { createRun, playRound, playerDecisionOrFreeze } from "./systems/run";
import { roundSeconds } from "./systems/scoring";
import type { AudienceId, GameState, StrategyId, Suit } from "./types";
import { startDust } from "./ui/dust";
import { esc } from "./ui/format";
import { muteIcon, suitMark } from "./ui/ornaments";

const STORE = "bdo-last";

interface LastRun {
  seed: string;
  name: string;
  win: boolean;
  line: string;
}

function readLast(): string {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return "";
    const data = JSON.parse(raw) as LastRun;
    return data.line ?? "";
  } catch {
    return "";
  }
}

function writeLast(data: LastRun): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(data));
  } catch {
    /* ignore quota / private mode */
  }
}

function initialState(): GameState {
  const params = new URLSearchParams(window.location.search);
  const seed = (params.get("seed") ?? "").trim().slice(0, 24) || randomSeed();
  return {
    scene: "title",
    seed,
    playerName: "七号",
    suit: null,
    run: null,
    briefingRound: 0,
    beat: 0,
    pickingRumor: false,
    socialMode: "ally",
    pending: {},
    timerLeft: 56,
    timerMax: 56,
    resolutionRound: null,
    ending: null,
    lastRunLine: readLast(),
  };
}

function sceneLabel(state: GameState): string {
  switch (state.scene) {
    case "title":
      return "入境处";
    case "visa":
      return "签证";
    case "briefing":
      return state.briefingRound === 0 ? "候场" : "加时预告";
    case "round":
      return state.briefingRound === 0 ? "第一幕" : "加时赛";
    case "resolution":
      return "结算";
    case "ending":
      return state.ending?.win ? "加冕" : "终场";
  }
}

function footHint(state: GameState): string {
  if (state.scene === "round") return "超时未完成三拍，名次沉底";
  if (state.scene === "visa") return "一张签证，一种死法";
  if (state.scene === "resolution") return "账是公开的，申诉不是";
  return "灯光部可以先走";
}

export class Game {
  readonly audio = new AudioDirector();
  state: GameState = initialState();
  muted = this.audio.muted;
  private readonly root: HTMLElement;
  private readonly quiet: boolean;
  private timerHandle = 0;
  private timerStartedAt = 0;
  private timerRunning = false;
  private locked = false;
  private dustStop: (() => void) | null = null;
  private cleanups: Array<() => void> = [];
  private selectedSuit: Suit | null = null;
  private clickGuard = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.addEventListener("pointerdown", () => this.audio.unlock(), { once: true });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "m" && event.key !== "M") return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      event.preventDefault();
      this.toggleMute();
    });
    this.render();
  }

  setSeed(seed: string): void {
    this.state.seed = seed.trim().slice(0, 24);
  }

  setName(name: string): void {
    this.state.playerName = name.trim().slice(0, 8);
  }

  randomizeSeed(): void {
    this.state.seed = randomSeed();
    const input = this.root.querySelector<HTMLInputElement>('input[name="seed"]');
    const serial = this.root.querySelector("#slip-serial");
    if (input) input.value = this.state.seed;
    if (serial) serial.textContent = this.state.seed;
  }

  goVisa(): void {
    const form = this.root.querySelector<HTMLFormElement>("#visa-form");
    if (form) {
      const data = new FormData(form);
      this.setName(String(data.get("name") ?? ""));
      const seed = String(data.get("seed") ?? "").trim();
      this.state.seed = seed.slice(0, 24) || randomSeed();
    }
    if (!this.state.playerName) this.state.playerName = "七号";
    this.selectedSuit = null;
    this.state.scene = "visa";
    this.audio.unlock();
    this.audio.sting("card");
    this.render();
  }

  chooseSuit(suit: Suit): void {
    this.state.suit = suit;
    this.state.run = createRun(this.state.seed, this.state.playerName || "七号", suit);
    this.state.briefingRound = 0;
    this.state.scene = "briefing";
    this.audio.sting("card");
    this.render();
  }

  beginRound(): void {
    const run = this.state.run;
    if (!run) return;
    const roundIndex = this.state.briefingRound;
    const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
    const seconds = roundSeconds(roundIndex, rule.id);
    this.state.beat = 0;
    this.state.pickingRumor = false;
    this.state.socialMode = "ally";
    this.state.pending = {};
    this.state.timerMax = seconds;
    this.state.timerLeft = seconds;
    this.timerRunning = false;
    this.state.scene = "round";
    this.audio.sting("tick");
    this.render();
  }

  private acceptClick(): boolean {
    return performance.now() >= this.clickGuard;
  }

  private armClick(): void {
    this.clickGuard = performance.now() + 280;
  }

  pickStrategy(id: StrategyId): void {
    if (this.state.scene !== "round" || this.locked || this.state.beat !== 0 || !this.acceptClick()) return;
    this.armClick();
    this.state.pending.strategy = id;
    this.state.beat = 1;
    this.state.pickingRumor = false;
    this.audio.sting("tick");
    this.render();
  }

  pickAudience(id: AudienceId): void {
    if (this.state.scene !== "round" || this.locked || this.state.beat !== 1 || this.state.pickingRumor || !this.acceptClick()) return;
    this.armClick();
    if (id === "rumor") {
      this.state.pending.audience = "rumor";
      this.state.pending.rumorTarget = null;
      this.state.pickingRumor = true;
      this.audio.sting("tick");
      this.render();
      return;
    }
    this.state.pending.audience = id;
    this.state.pending.rumorTarget = null;
    this.state.beat = 2;
    this.audio.sting("tick");
    this.render();
  }

  pickRumor(id: string): void {
    if (!this.state.pickingRumor || this.locked || !this.acceptClick()) return;
    this.armClick();
    this.state.pending.audience = "rumor";
    this.state.pending.rumorTarget = id;
    this.state.pickingRumor = false;
    this.state.beat = 2;
    this.audio.sting("tick");
    this.render();
  }

  cancelRumor(): void {
    if (!this.state.pickingRumor) return;
    delete this.state.pending.audience;
    this.state.pending.rumorTarget = null;
    this.state.pickingRumor = false;
    this.render();
  }

  setSocialMode(mode: "ally" | "betray"): void {
    this.state.socialMode = mode;
    this.root.querySelectorAll<HTMLButtonElement>("[data-act=social-mode]").forEach((button) => {
      button.classList.toggle("is-on", button.dataset.mode === mode);
    });
    const hint = this.root.querySelector("#social-hint");
    if (hint) {
      hint.textContent = mode === "ally"
        ? "把手递出去。双向握住才是盟。单方面，只算你伸过。"
        : "只有盟约才值得背叛。没有盟的刀，看起来像慌。";
    }
  }

  pickSocialTarget(id: string): void {
    if (this.state.scene !== "round" || this.state.beat !== 2 || this.locked || !this.acceptClick()) return;
    this.armClick();
    this.state.pending.social = this.state.socialMode;
    this.state.pending.socialTarget = id;
    this.resolvePending(false);
  }

  pickAbstain(): void {
    if (this.state.scene !== "round" || this.state.beat !== 2 || this.locked || !this.acceptClick()) return;
    this.armClick();
    this.state.pending.social = "abstain";
    this.state.pending.socialTarget = null;
    this.resolvePending(false);
  }

  continueAfterResolution(): void {
    if (!this.acceptClick()) return;
    const run = this.state.run;
    const index = this.state.resolutionRound;
    if (!run || index === null) return;
    const player = run.roster.find((c) => c.isPlayer);
    if (!player?.alive) {
      this.finish();
      return;
    }
    if (index === 0) {
      this.state.briefingRound = 1;
      this.state.scene = "briefing";
      this.audio.sting("card");
      this.render();
      return;
    }
    this.finish();
  }

  retrySame(): void {
    if (!this.state.suit) {
      this.backToTitle();
      return;
    }
    this.audio.setPulse(false);
    this.state.run = createRun(this.state.seed, this.state.playerName || "七号", this.state.suit);
    this.state.briefingRound = 0;
    this.state.ending = null;
    this.state.resolutionRound = null;
    this.state.pending = {};
    this.state.scene = "briefing";
    this.audio.sting("card");
    this.render();
  }

  backToTitle(): void {
    this.audio.setPulse(false);
    this.state.scene = "title";
    this.state.run = null;
    this.state.suit = null;
    this.state.ending = null;
    this.state.resolutionRound = null;
    this.state.pending = {};
    this.state.lastRunLine = readLast();
    this.render();
  }

  toggleMute(): void {
    this.audio.toggle();
    this.muted = this.audio.muted;
    const button = this.root.querySelector<HTMLButtonElement>("#mute");
    if (!button) return;
    button.classList.toggle("is-muted", this.muted);
    button.setAttribute("aria-pressed", String(this.muted));
    button.setAttribute("aria-label", this.muted ? "打开声音" : "关闭声音");
    button.innerHTML = muteIcon(this.muted);
  }

  private finish(): void {
    const run = this.state.run;
    if (!run) return;
    const ending = buildEnding(run);
    this.state.ending = ending;
    this.state.scene = "ending";
    writeLast({
      seed: run.seed,
      name: ending.name,
      win: ending.win,
      line: ending.win
        ? `上一张签证 · ${ending.name} · 冠军 · ${run.seed}`
        : `上一张签证 · ${ending.name} · ${ending.placeLabel}`,
    });
    this.state.lastRunLine = readLast();
    this.audio.setPulse(false);
    this.audio.sting(ending.win ? "crown" : "death");
    this.render();
  }

  private resolvePending(timedOut: boolean): void {
    const run = this.state.run;
    if (!run || this.locked || this.state.scene !== "round") return;
    this.locked = true;
    this.stopTimer();
    const decision = playerDecisionOrFreeze(this.state.pending, timedOut);
    const record = playRound(run, this.state.briefingRound, decision);
    this.state.resolutionRound = record.index;
    this.state.scene = "resolution";
    this.audio.setPulse(false);
    this.audio.sting(record.eliminated.includes("player") ? "death" : "stamp");
    this.locked = false;
    this.render();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerStartedAt = performance.now();
    this.timerRunning = true;
    this.timerHandle = window.setInterval(() => this.tickTimer(), 100);
  }

  private stopTimer(): void {
    this.timerRunning = false;
    if (this.timerHandle) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = 0;
    }
  }

  private tickTimer(): void {
    if (!this.timerRunning || this.state.scene !== "round") return;
    const left = Math.max(0, this.state.timerMax - (performance.now() - this.timerStartedAt) / 1000);
    this.state.timerLeft = left;
    this.paintTimer();
    this.audio.setPulse(left <= 10 && left > 0);
    if (left <= 0) {
      this.timerRunning = false;
      this.stopTimer();
      this.resolvePending(true);
    }
  }

  private paintTimer(): void {
    const num = this.root.querySelector("#timer-num");
    const ring = this.root.querySelector<SVGCircleElement>("#timer-ring");
    const timer = this.root.querySelector("#timer");
    const stage = this.root.querySelector(".stage");
    const ratio = this.state.timerMax <= 0 ? 0 : this.state.timerLeft / this.state.timerMax;
    const offset = 100.53 * (1 - Math.max(0, Math.min(1, ratio)));
    if (num) num.textContent = String(Math.ceil(this.state.timerLeft));
    if (ring) ring.style.strokeDashoffset = offset.toFixed(2);
    const late = this.state.timerLeft <= 10;
    timer?.classList.toggle("is-late", late);
    stage?.classList.toggle("is-late", late);
  }

  private render(): void {
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups = [];
    this.dustStop?.();
    this.dustStop = null;

    const state = this.state;
    let scene = "";
    if (state.scene === "title") scene = renderTitle(state);
    else if (state.scene === "visa") scene = renderVisa();
    else if (state.scene === "briefing") scene = renderBriefing(state);
    else if (state.scene === "round") scene = renderRound(state);
    else if (state.scene === "resolution") scene = renderResolution(state);
    else scene = renderEnding(state);

    const suit = state.run?.suit;
    const win = state.ending?.win === true;
    this.root.innerHTML = `<div class="stage ${this.quiet ? "is-quiet" : ""}" data-scene="${state.scene}" data-win="${win ? "true" : "false"}">
      <canvas id="dust"></canvas>
      <div class="spotlight"></div>
      <div class="vignette"></div>
      <svg class="grain" aria-hidden="true"><filter id="grain-filter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#grain-filter)"/></svg>
      <div class="binding"></div>
      ${suit ? `<div class="watermark suit-${suit}">${suitMark(suit, 340)}</div>` : ""}
      <header class="topbar">
        <div class="brand">选美 <span class="latin">/ Death Overtime</span></div>
        <div class="top-center">${sceneLabel(state)}</div>
        <div class="top-right">
          <span class="latin seed-chip">${esc(state.seed)}</span>
          <button type="button" id="mute" class="${this.muted ? "is-muted" : ""}" aria-pressed="${this.muted}" aria-label="${this.muted ? "打开声音" : "关闭声音"}">${muteIcon(this.muted)}</button>
        </div>
      </header>
      <main class="scene scene-in">${scene}</main>
      <footer class="foot">
        <span>委员会不接受申诉</span>
        <span class="latin">No appeals</span>
        <span>${footHint(state)}</span>
      </footer>
    </div>`;

    const canvas = this.root.querySelector<HTMLCanvasElement>("#dust");
    if (canvas) this.dustStop = startDust(canvas, this.quiet);
    this.bind();
    if (state.scene === "round") {
      if (!this.timerRunning) this.startTimer();
      else this.paintTimer();
    } else {
      this.stopTimer();
      this.audio.setPulse(false);
    }
  }

  private bind(): void {
    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>("[data-act]");
      if (!button) return;
      const act = button.dataset.act;
      if (act === "random-seed") this.randomizeSeed();
      if (act === "back-title") this.backToTitle();
      if (act === "select-suit") {
        const suit = button.dataset.suit as Suit;
        this.selectedSuit = suit;
        this.root.querySelectorAll<HTMLElement>("[data-act=select-suit]").forEach((card) => {
          card.classList.toggle("is-selected", card === button);
        });
        const confirm = this.root.querySelector<HTMLButtonElement>("[data-act=confirm-suit]");
        if (confirm) confirm.disabled = false;
        this.audio.sting("tick");
      }
      if (act === "confirm-suit" && this.selectedSuit) this.chooseSuit(this.selectedSuit);
      if (act === "begin-round") this.beginRound();
      if (act === "strategy") this.pickStrategy(button.dataset.id as StrategyId);
      if (act === "audience") this.pickAudience(button.dataset.id as AudienceId);
      if (act === "rumor-target" && button.dataset.id) this.pickRumor(button.dataset.id);
      if (act === "cancel-rumor") this.cancelRumor();
      if (act === "social-mode") this.setSocialMode(button.dataset.mode === "betray" ? "betray" : "ally");
      if (act === "social-target" && button.dataset.id) this.pickSocialTarget(button.dataset.id);
      if (act === "abstain") this.pickAbstain();
      if (act === "continue") this.continueAfterResolution();
      if (act === "retry-same") this.retrySame();
    };
    this.root.addEventListener("click", onClick);
    this.cleanups.push(() => this.root.removeEventListener("click", onClick));

    const form = this.root.querySelector<HTMLFormElement>("#visa-form");
    if (form) {
      const onSubmit = (event: Event) => {
        event.preventDefault();
        this.goVisa();
      };
      form.addEventListener("submit", onSubmit);
      this.cleanups.push(() => form.removeEventListener("submit", onSubmit));
      const seedInput = form.querySelector<HTMLInputElement>('input[name="seed"]');
      if (seedInput) {
        const onInput = () => {
          this.state.seed = seedInput.value.trim().slice(0, 24);
          const serial = this.root.querySelector("#slip-serial");
          if (serial) serial.textContent = this.state.seed || "—";
        };
        seedInput.addEventListener("input", onInput);
        this.cleanups.push(() => seedInput.removeEventListener("input", onInput));
      }
    }

    const mute = this.root.querySelector("#mute");
    if (mute) {
      const onMute = (event: Event) => {
        event.stopPropagation();
        this.toggleMute();
      };
      mute.addEventListener("click", onMute);
      this.cleanups.push(() => mute.removeEventListener("click", onMute));
    }

    if (this.state.scene === "round" || this.state.scene === "visa") {
      const onKey = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
        if ((event.key === "Escape" || event.key === "Backspace") && this.state.pickingRumor) {
          event.preventDefault();
          this.cancelRumor();
          return;
        }
        if (event.key === "Enter" && this.state.scene === "visa" && this.selectedSuit) {
          event.preventDefault();
          this.chooseSuit(this.selectedSuit);
          return;
        }
        const key = event.key.toLowerCase();
        const button = this.root.querySelector<HTMLButtonElement>(`[data-key="${key}"]`);
        if (button && !button.disabled) {
          event.preventDefault();
          button.click();
        }
      };
      document.addEventListener("keydown", onKey);
      this.cleanups.push(() => document.removeEventListener("keydown", onKey));
    }
  }
}
