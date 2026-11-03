import type { Ending, Seat } from "../types";
import { esc, scoreText } from "../ui/format";
import { crownMarkup, diamondMark } from "../ui/ornaments";

export function renderEnding(ending: Ending, seats: Seat[]): string {
  const fallen = seats
    .filter((seat) => !seat.alive && seat.id !== "player")
    .map((seat) => `${seat.name} ${scoreText(seat.score)}`)
    .join(" · ");
  if (ending.win) {
    return `<section class="ending ending-win">
      ${crownMarkup()}
      <p class="eyebrow"><span class="latin">Game clear</span></p>
      <h2>加冕文书</h2>
      <p class="ending-name">${esc(ending.name)}</p>
      <p class="ending-epitaph">庭上只剩你的数字。天平不再需要别人。</p>
      <p class="ending-body">皇冠在这里不是奖品，是一张允许你离开的文书。方块王若还在，会说这不公平；他已不在，所以公平由你带走。</p>
      ${fallen ? `<p class="ending-fallen">已溶：${esc(fallen)}</p>` : ""}
      <dl class="ending-meta">
        <div><dt>结局</dt><dd>GAME CLEAR</dd></div>
        <div><dt>案号</dt><dd class="latin">${esc(ending.seed)}</dd></div>
      </dl>
      <div class="ending-actions">
        <button type="button" class="btn" data-act="retry">同一案号再审</button>
        <button type="button" class="texty" data-act="title">回到庭门</button>
      </div>
    </section>`;
  }
  const player = seats.find((seat) => seat.id === "player");
  return `<section class="ending ending-death">
    <p class="eyebrow"><span class="latin">Game over</span> ${diamondMark(14)}</p>
    <h2>除名文书</h2>
    <div class="obit-rule"></div>
    <p class="ending-name">${esc(ending.name)}</p>
    <p class="ending-epitaph">你的分数被溶到了 ${player ? scoreText(player.score) : "−10"}。王水不关心你算得对不对。</p>
    <p class="ending-body">委员会把你的编号让给下一张空白。活着的人会继续把平均乘以 0.8，好像椅子从未空过。</p>
    ${fallen ? `<p class="ending-fallen">同庭已溶：${esc(fallen)}</p>` : ""}
    <dl class="ending-meta">
      <div><dt>结局</dt><dd>GAME OVER</dd></div>
      <div><dt>案号</dt><dd class="latin">${esc(ending.seed)}</dd></div>
    </dl>
    <div class="ending-actions">
      <button type="button" class="btn" data-act="retry">同一案号再审</button>
      <button type="button" class="texty" data-act="title">回到庭门</button>
    </div>
  </section>`;
}
