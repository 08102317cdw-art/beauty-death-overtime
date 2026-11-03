import { AudioDirector } from "./audio";
import { createSeats } from "./content/cast";
import { renderChoose } from "./scenes/choose";
import { renderDecree } from "./scenes/decree";
import { renderEnding } from "./scenes/ending";
import { renderSeat, renderTablet, renderTitle } from "./scenes/title";
import { renderVerdict } from "./scenes/verdict";
import { randomSeed } from "./rng";
import {
  aiNumber,
  applyOutcome,
  resolveRound,
  rulesNow,
  turnSeconds,
  unlockedClauses,
} from "./systems/contest";
import type { ClauseId, Ending, RoundOutcome, SceneId, Seat } from "./types";
import { bench } from "./ui/bench";
import { startDust } from "./ui/dust";
import { esc } from "./ui/format";
import { clock } from "./ui/format";
import { muteIcon, scalesBeam } from "./ui/ornaments";

const STORE = "bdo-last";

interface LastRun {
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

function writeLast(line: string): void {
  try {
    localStorage.setItem(STORE, JSON.stringify({ line }));
  } catch {
    /* ignore */
  }
}

interface State {
  scene: SceneId;
  seed: string;
  playerName: string;
  seats: Seat[];
  round: number;
  eliminated: number;
  fresh: ClauseId[];
  draft: string;
  timerLeft: number;
  timerMax: number;
  outcome: RoundOutcome | null;
  lastDuel: boolean;
  ending: Ending | null;
  lastLine: string;
}

function initial(): State {
  const params = new URLSearchParams(window.location.search);
  const seed = (params.get("seed") ?? "").trim().slice(0, 24) || randomSeed();
  return {
    scene: "title",
    seed,
    playerName: "七号",
    seats: [],
    round: 1,
    eliminated: 0,
    fresh: [],
    draft: "",
    timerLeft: 0,
    timerMax: 0,
    outcome: null,
    lastDuel: false,
    ending: null,
    lastLine: readLast(),
  };
}

function sceneLabel(scene: SceneId): string {
  switch (scene) {
    case "title":
      return "庭门";
    case "seat":
      return "入座";
    case "tablet":
      return "平板";
    case "decree":
      return "宣读";
    case "choose":
      return "落子";
    case "verdict":
      return "宣判";
    case "ending":
      return "终局";
  }
}

export class Game {
  readonly audio = new AudioDirector();
  state: State = initial();
  private readonly root: HTMLElement;
  private readonly quiet: boolean;
  private timerHandle = 0;
  private timerStartedAt = 0;
  private timerRunning = false;
  private locked = false;
  private dustStop: (() => void) | null = null;
  private cleanups: Array<() => void> = [];

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

  randomizeSeed(): void {
    this.state.seed = randomSeed();
    const input = this.root.querySelector<HTMLInputElement>('input[name="seed"]');
    const serial = this.root.querySelector("#slip-serial");
    if (input) input.value = this.state.seed;
    if (serial) serial.textContent = this.state.seed;
  }

  enter(): void {
    const form = this.root.querySelector<HTMLFormElement>("#case-form");
    if (form) {
      const data = new FormData(form);
      const name = String(data.get("name") ?? "").trim().slice(0, 8);
      const seed = String(data.get("seed") ?? "").trim().slice(0, 24);
      this.state.playerName = name || "七号";
      this.state.seed = seed || randomSeed();
    }
    this.state.seats = createSeats(this.state.playerName);
    this.state.round = 1;
    this.state.eliminated = 0;
    this.state.fresh = [];
    this.state.outcome = null;
    this.state.ending = null;
    this.state.scene = "seat";
    this.audio.unlock();
    this.audio.sting("card");
    this.render();
  }

  toggleMute(): void {
    this.audio.toggle();
    const button = this.root.querySelector<HTMLButtonElement>("#mute");
    if (!button) return;
    button.classList.toggle("is-muted", this.audio.muted);
    button.setAttribute("aria-pressed", String(this.audio.muted));
    button.setAttribute("aria-label", this.audio.muted ? "打开声音" : "关闭声音");
    button.innerHTML = muteIcon(this.audio.muted);
  }

  private beginRound(): void {
    const seconds = turnSeconds(this.state.round, this.state.fresh.length > 0);
    this.state.draft = "";
    this.state.timerMax = seconds;
    this.state.timerLeft = seconds;
    this.state.outcome = null;
    this.timerRunning = false;
    this.state.scene = "choose";
    this.audio.sting("tick");
    this.render();
  }

  private lock(number: number | null): void {
    if (this.locked || this.state.scene !== "choose") return;
    this.locked = true;
    this.stopTimer();
    const { seats, round, eliminated, seed } = this.state;
    const alive = seats.filter((seat) => seat.alive);
    const duel = rulesNow(eliminated, alive.length).duel;
    const submitted = alive.map((seat) => ({
      id: seat.id,
      number: seat.role === "player" ? number : aiNumber(seat.role, seed, round, duel),
    }));
    const outcome = resolveRound(seats, submitted, eliminated);
    const before = eliminated;
    applyOutcome(seats, outcome);
    const after = seats.filter((seat) => !seat.alive).length;
    const fresh = unlockedClauses(before, after);
    this.state.outcome = outcome;
    this.state.lastDuel = duel;
    this.state.eliminated = after;
    this.state.fresh = fresh;
    this.state.scene = "verdict";
    const playerDead = outcome.eliminatedIds.includes("player");
    this.audio.sting(playerDead ? "death" : outcome.eliminatedIds.length ? "stamp" : "card");
    this.locked = false;
    this.render();
  }

  private advance(): void {
    const player = this.state.seats.find((seat) => seat.id === "player");
    const alive = this.state.seats.filter((seat) => seat.alive);
    if (!player?.alive) {
      this.finish(false);
      return;
    }
    if (alive.length === 1) {
      this.finish(true);
      return;
    }
    this.state.round += 1;
    this.beginRound();
  }

  private finish(win: boolean): void {
    const player = this.state.seats.find((seat) => seat.id === "player");
    this.state.ending = { win, name: player?.name ?? "七号", seed: this.state.seed };
    this.state.scene = "ending";
    const line = win
      ? `上一案 · ${this.state.ending.name} · GAME CLEAR · ${this.state.seed}`
      : `上一案 · ${this.state.ending.name} · GAME OVER · ${this.state.seed}`;
    writeLast(line);
    this.state.lastLine = line;
    this.audio.sting(win ? "crown" : "death");
    this.render();
  }

  private retry(): void {
    this.state.seats = createSeats(this.state.playerName);
    this.state.round = 1;
    this.state.eliminated = 0;
    this.state.fresh = [];
    this.state.outcome = null;
    this.state.ending = null;
    this.state.scene = "seat";
    this.audio.sting("card");
    this.render();
  }

  private toTitle(): void {
    this.stopTimer();
    this.state.scene = "title";
    this.state.ending = null;
    this.state.lastLine = readLast();
    this.render();
  }

  private currentNumber(): number | null {
    if (this.state.draft.trim() === "") return null;
    const n = Number(this.state.draft);
    if (!Number.isInteger(n) || n < 0 || n > 100) return null;
    return n;
  }

  private setDraft(value: string): void {
    this.state.draft = value;
    this.paintDraft();
  }

  private nudge(by: number): void {
    const current = this.currentNumber() ?? 0;
    const next = Math.max(0, Math.min(100, current + by));
    this.setDraft(String(next));
  }

  private paintDraft(): void {
    const n = this.currentNumber();
    const num = this.root.querySelector("#pick-num");
    const fill = this.root.querySelector<HTMLElement>("#ruler-fill");
    const thumb = this.root.querySelector<HTMLElement>("#ruler-thumb");
    const button = this.root.querySelector<HTMLButtonElement>("[data-act=lock]");
    if (num) {
      num.textContent = n === null ? "未选" : String(n);
      num.classList.toggle("is-empty", n === null);
    }
    if (fill) fill.style.width = n === null ? "0%" : `${n}%`;
    if (thumb) {
      thumb.style.left = n === null ? "0%" : `${n}%`;
      thumb.style.opacity = n === null ? "0" : "1";
    }
    if (button) button.disabled = n === null;
    const ruler = this.root.querySelector("#ruler");
    if (ruler && n !== null) ruler.setAttribute("aria-valuenow", String(n));
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerStartedAt = performance.now();
    this.timerRunning = true;
    this.timerHandle = window.setInterval(() => this.tick(), 100);
  }

  private stopTimer(): void {
    this.timerRunning = false;
    if (this.timerHandle) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = 0;
    }
    this.audio.setPulse(false);
  }

  private tick(): void {
    if (!this.timerRunning || this.state.scene !== "choose") return;
    const left = Math.max(0, this.state.timerMax - (performance.now() - this.timerStartedAt) / 1000);
    this.state.timerLeft = left;
    this.paintTimer();
    this.audio.setPulse(left > 0 && left <= 10);
    if (left <= 0) {
      this.timerRunning = false;
      this.stopTimer();
      this.lock(null);
    }
  }

  private paintTimer(): void {
    const num = this.root.querySelector("#timer-num");
    const ring = this.root.querySelector<SVGCircleElement>("#timer-ring");
    const timer = this.root.querySelector("#timer");
    const ratio = this.state.timerMax <= 0 ? 0 : this.state.timerLeft / this.state.timerMax;
    const offset = 100.53 * (1 - Math.max(0, Math.min(1, ratio)));
    if (num) num.textContent = clock(this.state.timerLeft);
    if (ring) ring.style.strokeDashoffset = offset.toFixed(2);
    timer?.classList.toggle("is-late", this.state.timerLeft <= 10);
  }

  private render(): void {
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups = [];
    this.dustStop?.();
    this.dustStop = null;
    const state = this.state;
    const beam = scalesBeam();
    const row = state.seats.length ? bench(state.seats) : "";
    const showBench = state.scene === "choose" || state.scene === "verdict";
    let scene = "";
    if (state.scene === "title") scene = renderTitle(state.seed, state.playerName, state.lastLine);
    else if (state.scene === "seat") scene = renderSeat(beam, bench(state.seats));
    else if (state.scene === "tablet") scene = renderTablet();
    else if (state.scene === "decree") scene = renderDecree();
    else if (state.scene === "choose") {
      const active = (["duplicate", "exact", "duel"] as ClauseId[]).filter((id) => {
        if (id === "duplicate") return state.eliminated >= 1;
        if (id === "exact") return state.eliminated >= 2;
        return state.eliminated >= 3;
      });
      const long = state.round <= 1 || state.fresh.length > 0;
      scene = renderChoose(state.round, active, long, state.timerLeft, state.timerMax);
    } else if (state.scene === "verdict" && state.outcome) {
      const playerAlive = state.seats.some((seat) => seat.id === "player" && seat.alive);
      const onlyPlayer = state.seats.filter((seat) => seat.alive).every((seat) => seat.id === "player");
      scene = renderVerdict(state.seats, state.outcome, state.round, state.lastDuel, state.fresh, playerAlive, onlyPlayer);
    } else if (state.ending) scene = renderEnding(state.ending, state.seats);

    const win = state.ending?.win === true;
    this.root.innerHTML = `<div class="stage ${this.quiet ? "is-quiet" : ""}" data-scene="${state.scene}" data-win="${win ? "true" : "false"}">
      <canvas id="dust"></canvas>
      <div class="spotlight"></div>
      <div class="vignette"></div>
      <svg class="grain" aria-hidden="true"><filter id="grain-filter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#grain-filter)"/></svg>
      <div class="binding"></div>
      <header class="topbar">
        <div class="brand">选美 <span class="latin">/ Death Overtime</span></div>
        <div class="top-center">${sceneLabel(state.scene)}</div>
        <div class="top-right">
          <span class="latin seed-chip">${esc(state.seed)}</span>
          <button type="button" id="mute" class="${this.audio.muted ? "is-muted" : ""}" aria-pressed="${this.audio.muted}" aria-label="${this.audio.muted ? "打开声音" : "关闭声音"}">${muteIcon(this.audio.muted)}</button>
        </div>
      </header>
      <main class="scene scene-in">
        ${showBench ? `<div class="court-top">${beam}${row}</div>` : ""}
        ${scene}
      </main>
      <footer class="foot">
        <span>负十除名</span>
        <span class="latin">King of diamonds</span>
        <span>王水只溶名字</span>
      </footer>
    </div>`;

    const canvas = this.root.querySelector<HTMLCanvasElement>("#dust");
    if (canvas) this.dustStop = startDust(canvas, this.quiet);
    this.bind();
    if (state.scene === "choose") {
      this.paintDraft();
      if (!this.timerRunning) this.startTimer();
      else this.paintTimer();
    } else {
      this.stopTimer();
    }
  }

  private bind(): void {
    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>("[data-act]");
      if (!button) return;
      const act = button.dataset.act;
      if (act === "random-seed") this.randomizeSeed();
      if (act === "to-tablet") {
        this.state.scene = "tablet";
        this.audio.sting("tick");
        this.render();
      }
      if (act === "to-decree") {
        this.state.scene = "decree";
        this.audio.sting("card");
        this.render();
      }
      if (act === "begin") this.beginRound();
      if (act === "nudge") this.nudge(Number(button.dataset.by ?? 0));
      if (act === "lock") {
        const n = this.currentNumber();
        if (n !== null) this.lock(n);
      }
      if (act === "next" || act === "ending") this.advance();
      if (act === "retry") this.retry();
      if (act === "title") this.toTitle();
    };
    this.root.addEventListener("click", onClick);
    this.cleanups.push(() => this.root.removeEventListener("click", onClick));

    const form = this.root.querySelector<HTMLFormElement>("#case-form");
    if (form) {
      const onSubmit = (event: Event) => {
        event.preventDefault();
        this.enter();
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

    const ruler = this.root.querySelector<HTMLElement>("#ruler");
    if (ruler) {
      const pick = (clientX: number) => {
        const rect = ruler.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this.setDraft(String(Math.round(t * 100)));
      };
      const onPointer = (event: PointerEvent) => {
        ruler.setPointerCapture(event.pointerId);
        pick(event.clientX);
      };
      const onMove = (event: PointerEvent) => {
        if (event.buttons === 0 && event.pointerType === "mouse") return;
        pick(event.clientX);
      };
      ruler.addEventListener("pointerdown", onPointer);
      ruler.addEventListener("pointermove", onMove);
      this.cleanups.push(() => {
        ruler.removeEventListener("pointerdown", onPointer);
        ruler.removeEventListener("pointermove", onMove);
      });
    }

    if (this.state.scene === "choose") {
      const onKey = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
        if (event.key >= "0" && event.key <= "9") {
          event.preventDefault();
          const next = `${this.state.draft}${event.key}`.replace(/^0+(?=\d)/, "");
          const value = Number(next);
          if (Number.isInteger(value) && value <= 100) this.setDraft(next === "" ? "0" : String(value));
          return;
        }
        if (event.key === "Backspace") {
          event.preventDefault();
          this.setDraft(this.state.draft.slice(0, -1));
          return;
        }
        if (event.key === "Enter") {
          const n = this.currentNumber();
          if (n !== null) this.lock(n);
          return;
        }
        if (event.key === "ArrowUp" || event.key === "ArrowRight") {
          event.preventDefault();
          this.nudge(1);
        }
        if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
          event.preventDefault();
          this.nudge(-1);
        }
      };
      document.addEventListener("keydown", onKey);
      this.cleanups.push(() => document.removeEventListener("keydown", onKey));
    }
  }
}
