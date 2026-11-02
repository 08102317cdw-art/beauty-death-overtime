import { decisionLabel } from "../content/rules";
import { epitaphFor, roundHeadline } from "../content/epitaphs";
import type { GameState } from "../types";
import { esc, signed } from "../ui/format";
import { portraitFrame } from "../ui/widgets";

export function renderResolution(state: GameState): string {
  const run = state.run;
  const index = state.resolutionRound;
  if (!run || index === null) return "";
  const record = run.rounds[index];
  if (!record) return "";
  const playerAlive = run.roster.some((c) => c.isPlayer && c.alive);
  const headline = roundHeadline(record, run);
  const rows = record.ranking
    .map((id, rank) => {
      const person = run.roster.find((c) => c.id === id);
      const score = record.scores[id];
      const decision = record.decisions[id];
      if (!person || !score || !decision) return "";
      const dead = record.eliminated.includes(id);
      const targetName = (target: string | null) => run.roster.find((c) => c.id === target)?.name ?? "";
      const line = [
        decisionLabel(decision.strategy),
        decisionLabel(decision.audience, decision.audience === "rumor" ? targetName(decision.rumorTarget) : null),
        decisionLabel(decision.social, targetName(decision.socialTarget)),
      ].join(" · ");
      const parts = `底 ${signed(score.base)} · 走 ${signed(score.strategy)} · 观 ${signed(score.audience)} · 人 ${signed(score.social)} · 规 ${signed(score.rule)} · 罚 ${signed(-score.penalty)} · 运 ${signed(score.jitter)}`;
      const epitaph = dead ? `<p class="row-epitaph">${esc(epitaphFor(person, score.tags, run.seed))}</p>` : "";
      return `<li class="${dead ? "is-dead" : "is-live"} ${person.isPlayer ? "is-player" : ""} ${rank === 0 ? "is-lead" : ""}">
        <span class="rank latin">${String(rank + 1).padStart(2, "0")}</span>
        ${portraitFrame(person, "sm", dead)}
        <div class="ledger-who">
          <strong>${esc(person.name)}</strong>
          <em>${esc(line)}</em>
          <span>${parts}</span>
          ${epitaph}
        </div>
        <b class="latin">${score.total}</b>
      </li>`;
    })
    .join("");

  const stamp = record.index === 1
    ? playerAlive
      ? `<div class="stamp stamp-gold">加冕</div>`
      : `<div class="stamp">退场</div>`
    : `<div class="stamp">淘汰</div>`;

  const next = !playerAlive
    ? "阅读讣告"
    : record.index === 0
      ? "进入加时赛"
      : "接受皇冠";

  return `<section class="resolution-scene">
    <header class="scene-head">
      <p class="eyebrow">${record.index === 0 ? "第一幕结算" : "加时结算"}</p>
      <div class="res-title">
        <h2>${esc(headline)}</h2>
        ${stamp}
      </div>
      <p class="lede">账在灯下是公开的。同分时，黑料更重的人靠后。加时赛只留第一。</p>
    </header>
    <ol class="ledger">${rows}</ol>
    <div class="res-actions">
      <button type="button" class="btn" data-act="continue">${next}</button>
    </div>
  </section>`;
}
