import { AUDIENCE_COPY, SOCIAL_COPY, STRATEGY_COPY, decisionLabel } from "../content/rules";
import type { AudienceId, GameState, StrategyId } from "../types";
import { esc } from "../ui/format";
import { choiceButton, portraitFrame, ruleCard } from "../ui/widgets";

const STRATEGIES: StrategyId[] = ["glamour", "craft", "scandal", "borrow"];
const AUDIENCES: AudienceId[] = ["speech", "bribe", "rumor", "silence"];
const INDEX = ["I", "II", "III", "IV"];

function strategyTag(state: GameState, id: StrategyId): { text: string; tone: "gold" | "blood" } | null {
  const rule = state.briefingRound === 0 ? state.run?.rule1 : state.run?.ruleOT;
  if (!rule || !state.run) return null;
  if (rule.id === "public_lie" && id === state.run.lieRecommend) return { text: "公示建议", tone: "gold" };
  if (rule.id === "lens_hunger" && (id === "scandal" || id === "borrow")) return { text: "空镜", tone: "blood" };
  if (rule.id === "hot_light" && id === "glamour") return { text: "热灯", tone: "gold" };
  if (rule.id === "smile_tax" && id === "glamour") return { text: "微笑税", tone: "gold" };
  if ((rule.id === "dirt_window" || rule.id === "showdown_dirt") && id === "scandal") return { text: "可兑换", tone: "gold" };
  if ((rule.id === "handshake" || rule.id === "chain_letter" || rule.id === "blood_due") && id === "borrow") {
    return { text: "借盟", tone: "gold" };
  }
  return null;
}

function audienceTag(state: GameState, id: AudienceId): { text: string; tone: "gold" | "blood" } | null {
  const rule = state.briefingRound === 0 ? state.run?.rule1 : state.run?.ruleOT;
  if (!rule) return null;
  if (rule.id === "silence_prize" && id === "silence") return { text: "金奖", tone: "gold" };
  if (rule.id === "the_dogs" && id !== "silence") return { text: "票权翻倍", tone: "gold" };
  if (rule.id === "the_dogs" && id === "silence") return { text: "翻倍后仍轻", tone: "blood" };
  return null;
}

function crumb(state: GameState): string {
  const run = state.run;
  if (!run) return "";
  const nameOf = (id: string | null | undefined) => run.roster.find((c) => c.id === id)?.name ?? "";
  const pending = state.pending;
  const strategy = pending.strategy ? decisionLabel(pending.strategy) : "…";
  const audience = pending.audience
    ? decisionLabel(pending.audience, pending.audience === "rumor" ? nameOf(pending.rumorTarget) : null)
    : "…";
  const social = pending.social ? decisionLabel(pending.social, nameOf(pending.socialTarget)) : "…";
  const cells = [
    ["走位", strategy, state.beat > 0],
    ["观众", audience, state.beat > 1],
    ["人心", social, false],
  ];
  return `<p class="crumb">${cells
    .map(
      ([label, value, on]) =>
        `<span class="${on ? "is-on" : ""}"><em>${label}</em> ${esc(String(value))}</span>`,
    )
    .join("")}</p>`;
}

export function renderRound(state: GameState): string {
  const run = state.run;
  if (!run) return "";
  const roundIndex = state.briefingRound;
  const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
  const rivals = run.roster.filter((c) => !c.isPlayer && c.alive);
  const beatTitle = state.pickingRumor
    ? "第二拍 · 把风放给谁"
    : ["第一拍 · 走位", "第二拍 · 观众", "第三拍 · 人心"][state.beat];
  const kicker = roundIndex === 0 ? "第一幕 · 泳装与才艺" : "加时赛 · 只留一张脸";

  let body = "";
  if (state.beat === 0) {
    body = STRATEGIES.map((id, index) => {
      const copy = STRATEGY_COPY[id];
      return choiceButton(String(index + 1), "strategy", id, INDEX[index], copy.name, copy.desc, strategyTag(state, id));
    }).join("");
  } else if (state.beat === 1 && state.pickingRumor) {
    body = `${rivals
      .map((rival, index) => {
        const clean = rival.dirt < 10 || rival.personality === "saint";
        return `<button type="button" class="target" data-act="rumor-target" data-id="${rival.id}" data-key="${index + 1}">
          ${portraitFrame(rival, "sm")}
          <span>
            <strong>${esc(rival.name)}</strong>
            <em>${esc(rival.personalityLabel)} · 黑料 ${rival.dirt}${clean ? " · 干净" : ""}</em>
          </span>
        </button>`;
      })
      .join("")}
      <button type="button" class="texty back" data-act="cancel-rumor">收回这根刺</button>`;
  } else if (state.beat === 1) {
    body = AUDIENCES.map((id, index) => {
      const copy = AUDIENCE_COPY[id];
      return choiceButton(String(index + 1), "audience", id, INDEX[index], copy.name, copy.desc, audienceTag(state, id));
    }).join("");
  } else {
    const mode = state.socialMode;
    const hint = mode === "ally" ? SOCIAL_COPY.ally.desc : SOCIAL_COPY.betray.desc;
    body = `<div class="social-switch">
        <button type="button" data-act="social-mode" data-mode="ally" data-key="a" class="${mode === "ally" ? "is-on" : ""}">结盟</button>
        <button type="button" data-act="social-mode" data-mode="betray" data-key="b" class="${mode === "betray" ? "is-on" : ""}">背刺</button>
        <button type="button" data-act="abstain" data-key="0">旁观</button>
      </div>
      <p class="social-hint" id="social-hint">${hint}</p>
      <div class="target-row">${rivals
        .map((rival, index) => {
          return `<button type="button" class="target" data-act="social-target" data-id="${rival.id}" data-key="${index + 1}">
            ${portraitFrame(rival, "sm")}
            <span>
              <strong>${esc(rival.name)}</strong>
              <em>${esc(rival.personalityLabel)} · 人气 ${rival.popularity}</em>
            </span>
          </button>`;
        })
        .join("")}</div>`;
  }

  const cast = rivals
    .map((rival) => {
      return `<div class="side-rival">
        ${portraitFrame(rival, "sm")}
        <div>
          <strong>${esc(rival.name)}</strong>
          <em>${esc(rival.personalityLabel)}</em>
          <span class="latin">${rival.popularity} / ${rival.acting} / ${rival.dirt}</span>
        </div>
      </div>`;
    })
    .join("");

  const ratio = state.timerMax <= 0 ? 0 : state.timerLeft / state.timerMax;
  const c = 100.53;
  const offset = c * (1 - Math.max(0, Math.min(1, ratio)));
  const late = state.timerLeft <= 10;

  return `<section class="round-scene">
    <div class="round-grid">
      <aside class="round-rule">
        <p class="eyebrow">${kicker}</p>
        ${ruleCard(rule)}
        ${crumb(state)}
      </aside>
      <div class="round-play">
        <header class="round-head">
          <div>
            <p class="eyebrow"><span class="latin">Beat</span></p>
            <h2>${beatTitle}</h2>
          </div>
          <div class="timer ${late ? "is-late" : ""}" id="timer">
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="16" class="timer-track"></circle>
              <circle id="timer-ring" cx="22" cy="22" r="16" class="timer-value" stroke-dasharray="${c}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
            </svg>
            <strong id="timer-num" class="latin">${Math.ceil(state.timerLeft)}</strong>
          </div>
        </header>
        <div class="choices">${body}</div>
      </div>
      <aside class="round-cast">
        <p class="eyebrow">在场</p>
        ${cast}
        <p class="cast-key">人气 / 演技 / 黑料</p>
      </aside>
    </div>
  </section>`;
}
