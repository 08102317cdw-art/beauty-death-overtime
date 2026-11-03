import { BOONS } from "../content/copy";
import type { BoonId } from "../types";

export function renderReward(afterTrial: 1 | 2, order: BoonId[]): string {
  const cards = order
    .map((id, index) => {
      const boon = BOONS[id];
      return `<button type="button" class="reward-card" data-act="boon" data-id="${id}">
        <span class="latin">0${index + 1}</span>
        <span class="doc-kicker">${boon.kicker}</span>
        <strong>${boon.title}</strong>
        <span>${boon.text}</span>
      </button>`;
    })
    .join("");
  return `<section class="reward">
    <header class="scene-head">
      <p class="eyebrow"><span class="latin">Between courts</span> · 第 ${afterTrial} 庭已关</p>
      <h2>三选一</h2>
      <p class="lede">只盖一张。它们改的是你能看见的东西，或规则咬人的方式，不是把分数加成武器。</p>
    </header>
    <div class="reward-grid">${cards}</div>
  </section>`;
}
