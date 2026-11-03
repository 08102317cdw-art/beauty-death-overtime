import { BASE_ARTICLES, CLAUSES, TIMEOUT_LINE, clauseOrder } from "../content/copy";
import type { ClauseId } from "../types";
import { clock } from "../ui/format";

export function renderChoose(round: number, active: ClauseId[], long: boolean, seconds: number, max: number): string {
  const articles = BASE_ARTICLES.map(
    (article) => `<p><b>${article.kicker} ${article.title}。</b>${article.text}</p>`,
  ).join("");
  const extras = clauseOrder(active)
    .map((id) => {
      const clause = CLAUSES[id];
      return `<p class="is-live"><b>${clause.kicker} ${clause.title}。</b>${clause.text}</p>`;
    })
    .join("");
  const ratio = max <= 0 ? 0 : seconds / max;
  const circ = 100.53;
  const offset = circ * (1 - Math.max(0, Math.min(1, ratio)));
  const late = seconds <= 10;
  return `<section class="choose">
    <header class="choose-head">
      <div>
        <p class="eyebrow">第 ${round} 轮${long ? " · 五分钟" : " · 一分钟"}</p>
        <h2>${long ? "消化规则" : "落子"}</h2>
      </div>
      <div class="timer ${late ? "is-late" : ""}" id="timer">
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="16" class="timer-track"></circle>
          <circle id="timer-ring" cx="22" cy="22" r="16" class="timer-value" stroke-dasharray="${circ}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
        </svg>
        <strong id="timer-num" class="latin">${clock(seconds)}</strong>
      </div>
    </header>
    <div class="choose-grid">
      <div class="document document-slim">
        <p class="doc-seal">庭审中</p>
        ${articles}
        ${extras}
        <p class="doc-timeout">${TIMEOUT_LINE}</p>
      </div>
      <div class="tablet">
        <p class="latin">Your integer</p>
        <div class="tablet-num" id="pick-num">—</div>
        <div class="ruler" id="ruler" role="slider" aria-valuemin="0" aria-valuemax="100" aria-label="选择整数" tabindex="0">
          <div class="ruler-fill" id="ruler-fill"></div>
          <div class="ruler-thumb" id="ruler-thumb"></div>
        </div>
        <div class="ruler-ends"><span>0</span><span>100</span></div>
        <div class="tablet-keys">
          <button type="button" data-act="nudge" data-by="-10">−10</button>
          <button type="button" data-act="nudge" data-by="-1">−1</button>
          <button type="button" data-act="nudge" data-by="1">+1</button>
          <button type="button" data-act="nudge" data-by="10">+10</button>
        </div>
        <button type="button" class="btn lock" data-act="lock" disabled>落子</button>
        <p class="tablet-hint">可键入数字。退格修改。回车落子。</p>
      </div>
    </div>
  </section>`;
}
