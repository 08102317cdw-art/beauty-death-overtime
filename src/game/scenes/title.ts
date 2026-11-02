import type { GameState } from "../types";
import { esc } from "../ui/format";
import { sealMarkup } from "../ui/ornaments";

export function renderTitle(state: GameState): string {
  const name = state.playerName || "七号";
  return `<section class="title-scene">
    <div class="title-copy">
      <p class="eyebrow"><span class="latin">Border Committee</span> · 未公开赛区</p>
      <h1>
        <span class="line">选美</span>
        <span class="rule-break"></span>
        <span class="line line-sub">死亡加时赛</span>
      </h1>
      <p class="tagline">美是通行证。超时是死刑。</p>
      <p class="tagline-en latin">Rules are a dress code. Overtime is a funeral.</p>
      ${state.lastRunLine ? `<p class="last-run">${esc(state.lastRunLine)}</p>` : ""}
    </div>
    <div class="title-side">
      ${sealMarkup()}
      <form class="slip" id="visa-form">
        <div class="slip-head">
          <span class="latin">Visa application</span>
          <span class="latin slip-serial" id="slip-serial">${esc(state.seed)}</span>
        </div>
        <label>姓名
          <input name="name" maxlength="8" autocomplete="off" value="${esc(name)}" />
        </label>
        <label>签证号
          <input name="seed" maxlength="24" autocomplete="off" spellcheck="false" value="${esc(state.seed)}" />
        </label>
        <div class="slip-actions">
          <button type="submit">领取签证</button>
          <button type="button" class="texty" data-act="random-seed">换号</button>
        </div>
        <p class="slip-note">委员会不保证存活。保证灯光准时。</p>
      </form>
    </div>
  </section>`;
}
