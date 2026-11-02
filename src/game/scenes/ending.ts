import { SUITS } from "../content/rules";
import type { GameState } from "../types";
import { esc } from "../ui/format";
import { crownMarkup, suitMark } from "../ui/ornaments";

export function renderEnding(state: GameState): string {
  const ending = state.ending;
  if (!ending) return "";
  const suit = SUITS[ending.suit];
  if (ending.win) {
    return `<section class="ending ending-win">
      ${crownMarkup()}
      <p class="eyebrow"><span class="latin">Survival visa</span> · ${esc(suit.name)}</p>
      <h2>${esc(ending.title)}</h2>
      <p class="ending-name">${esc(ending.name)}</p>
      <p class="ending-epitaph">${esc(ending.epitaph)}</p>
      <p class="ending-body">${esc(ending.body)}</p>
      <dl class="ending-meta">
        <div><dt>名次</dt><dd>${esc(ending.placeLabel)}</dd></div>
        <div><dt>签证号</dt><dd class="latin">${esc(ending.seed)}</dd></div>
        <div><dt>入口</dt><dd class="meta-suit">${suitMark(ending.suit, 14)} ${esc(suit.name)}</dd></div>
      </dl>
      <div class="ending-actions">
        <button type="button" class="btn" data-act="retry-same">同一签证再入场</button>
        <button type="button" class="texty" data-act="back-title">回到入境处</button>
      </div>
    </section>`;
  }
  return `<section class="ending ending-death">
    <p class="eyebrow"><span class="latin">Notice of departure</span></p>
    <h2>${esc(ending.title)}</h2>
    <div class="obit-rule"></div>
    <p class="ending-name">${esc(ending.name)}</p>
    <p class="ending-epitaph">${esc(ending.epitaph)}</p>
    <p class="ending-body">${esc(ending.body)}</p>
    <dl class="ending-meta">
      <div><dt>名次</dt><dd>${esc(ending.placeLabel)}</dd></div>
      <div><dt>签证号</dt><dd class="latin">${esc(ending.seed)}</dd></div>
      <div><dt>入口</dt><dd class="meta-suit">${suitMark(ending.suit, 14)} ${esc(suit.name)}</dd></div>
    </dl>
    <div class="ending-actions">
      <button type="button" class="btn" data-act="retry-same">同一签证再入场</button>
      <button type="button" class="texty" data-act="back-title">回到入境处</button>
    </div>
  </section>`;
}
