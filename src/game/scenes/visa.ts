import { SUIT_ORDER, SUITS } from "../content/rules";
import { esc } from "../ui/format";
import { suitMark } from "../ui/ornaments";

export function renderVisa(): string {
  const cards = SUIT_ORDER.map((id, index) => {
    const suit = SUITS[id];
    return `<button type="button" class="visa-card" data-act="select-suit" data-suit="${id}" data-key="${index + 1}">
      <span class="visa-watermark">${suitMark(id, 150)}</span>
      <span class="latin visa-index">0${index + 1}</span>
      <span class="visa-mark">${suitMark(id, 34)}</span>
      <span class="visa-name">${suit.name}</span>
      <span class="visa-domain">${suit.domain}</span>
      <span class="visa-pitch">${esc(suit.pitch)}</span>
      <span class="visa-body">${esc(suit.visa)}</span>
    </button>`;
  }).join("");

  return `<section class="visa-scene">
    <header class="scene-head">
      <p class="eyebrow"><span class="latin">Choose a death</span> · 四张签证</p>
      <h2>入口决定规则的脾气</h2>
      <p class="lede">才能是你自己带来的。签证只决定这栋楼今晚用什么方式看你。</p>
    </header>
    <div class="visa-grid">${cards}</div>
    <div class="visa-confirm">
      <button type="button" class="btn" data-act="confirm-suit" disabled>盖章入境</button>
      <button type="button" class="texty" data-act="back-title">返回</button>
    </div>
  </section>`;
}
