import { briefingNotes } from "../content/notes";
import { coachLine } from "../content/roster";
import { SUITS } from "../content/rules";
import type { GameState } from "../types";
import { roundSeconds } from "../systems/scoring";
import { esc } from "../ui/format";
import { suitMark } from "../ui/ornaments";
import { meters, portraitFrame, ruleCard } from "../ui/widgets";

export function renderBriefing(state: GameState): string {
  const run = state.run;
  if (!run) return "";
  const roundIndex = state.briefingRound;
  const player = run.roster.find((c) => c.isPlayer);
  if (!player) return "";
  const rivals = run.roster.filter((c) => !c.isPlayer);
  const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
  const seconds = roundSeconds(roundIndex, rule.id);
  const suit = SUITS[run.suit];
  const notes = briefingNotes(run, roundIndex);
  const kicker = roundIndex === 0 ? "第一幕 · 泳装与才艺" : "加时赛 · 规则改口";
  const title = roundIndex === 0 ? "候场" : "加时预告";
  const lede =
    roundIndex === 0
      ? "他们看的不是布料，是你还敢不敢把皮肤借给灯光。"
      : "上一幕活下来，只说明灯还没看厌你。这一轮只签发一张存活签证。";

  const cast = rivals
    .map((rival) => {
      const dead = !rival.alive;
      return `<article class="cast-card ${dead ? "is-dead" : ""}">
        ${portraitFrame(rival, "sm", dead)}
        <div>
          <div class="cast-name">${esc(rival.name)} <em>${esc(rival.epithet)}</em></div>
          <div class="cast-meta">${esc(rival.personalityLabel)} · 人气 ${rival.popularity} · 演技 ${rival.acting} · 黑料 ${rival.dirt}</div>
          <p>${esc(dead ? "灯已收回。编号还在，人已经是一句划掉的话。" : rival.bio)}</p>
        </div>
      </article>`;
    })
    .join("");

  const noteHtml = notes.length
    ? `<ul class="notes">${notes.map((note) => `<li>${esc(note)}</li>`).join("")}</ul>`
    : "";

  return `<section class="brief-scene">
    <header class="scene-head brief-head">
      <p class="eyebrow"><span class="mark-inline">${suitMark(run.suit, 16)}</span> ${esc(suit.name)} · ${kicker}</p>
      <h2>${title}</h2>
      <p class="lede">${lede}</p>
    </header>
    <div class="brief-grid">
      <div class="brief-player">
        ${portraitFrame(player, "lg")}
        <div class="brief-you">
          <p class="latin">No. 07</p>
          <h3>${esc(player.name)} <em>${esc(player.epithet)}</em></h3>
          ${meters(player)}
          <p class="coach">${esc(coachLine(player))}</p>
        </div>
      </div>
      <div class="brief-rule">
        ${ruleCard(rule, `<p class="rule-foot">上场后 ${seconds} 秒。超时未完成三拍，名次沉底。同分时黑料更重者靠后。</p>`)}
        ${noteHtml}
        <div class="brief-actions">
          <button type="button" class="btn" data-act="begin-round">上场 · ${seconds}秒</button>
        </div>
      </div>
      <div class="brief-cast">${cast}</div>
    </div>
  </section>`;
}
