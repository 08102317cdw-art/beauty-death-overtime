import { esc } from "../ui/format";
import { sealMarkup } from "../ui/ornaments";

export function renderTitle(seed: string, name: string, lastLine: string): string {
  return `<section class="title-scene">
    <div class="title-copy">
      <p class="eyebrow"><span class="latin">Supreme Court</span> · 临时开庭</p>
      <h1>
        <span class="line">选美</span>
        <span class="rule-break"></span>
        <span class="line line-sub">死亡加时赛</span>
      </h1>
      <p class="tagline">三场巡回。不是比谁好看，是比谁更懂别人有多懂。</p>
      <p class="tagline-en latin">A number is a face. The average is a jury.</p>
      ${lastLine ? `<p class="last-run">${esc(lastLine)}</p>` : ""}
    </div>
    <div class="title-side">
      ${sealMarkup()}
      <form class="slip" id="case-form">
        <div class="slip-head">
          <span class="latin">Case</span>
          <span class="latin slip-serial" id="slip-serial">${esc(seed)}</span>
        </div>
        <label>姓名
          <input name="name" maxlength="8" autocomplete="off" value="${esc(name || "七号")}" />
        </label>
        <label>案号
          <input name="seed" maxlength="24" autocomplete="off" spellcheck="false" value="${esc(seed)}" />
        </label>
        <div class="slip-actions">
          <button type="submit">领取签证</button>
          <button type="button" class="texty" data-act="random-seed">换号</button>
        </div>
        <p class="slip-note">前两场抽人。方块王只在第三庭进门。</p>
      </form>
    </div>
  </section>`;
}

export function renderSeat(beam: string, row: string): string {
  return `<section class="ceremony">
    <header class="scene-head">
      <p class="eyebrow"><span class="latin">Take the bench</span></p>
      <h2>入座</h2>
      <p class="lede">五把椅子，一架天平。这一庭先没有王。读完他们的习惯，再把数字放上平板。</p>
    </header>
    <div class="court-top">${beam}${row}</div>
    <div class="ceremony-actions"><button type="button" class="btn" data-act="to-tablet">坐下</button></div>
  </section>`;
}

export function renderTablet(): string {
  return `<section class="ceremony tablet-intro">
    <header class="scene-head">
      <p class="eyebrow"><span class="latin">Confirm the tablet</span></p>
      <h2>确认平板</h2>
    </header>
    <div class="tablet tablet-hero">
      <p class="latin">Tablet</p>
      <div class="tablet-num">0–100</div>
      <p>这台平板只收一个整数。从零到一百。它不认识脸，也不接受解释。</p>
    </div>
    <div class="ceremony-actions"><button type="button" class="btn" data-act="to-decree">确认平板</button></div>
  </section>`;
}
