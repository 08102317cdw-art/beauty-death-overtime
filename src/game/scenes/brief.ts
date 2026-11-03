import type { BoonId, Seat } from "../types";
import { depthBand } from "../systems/tour";
import { esc } from "../ui/format";
import { portraitSVG } from "../ui/portrait";
import { diamondMark } from "../ui/ornaments";

const BOON_SHORT: Record<BoonId, string> = {
  glimpse: "窥层",
  imprint: "重印",
  reprieve: "缓刑",
};

export function renderBrief(
  trial: 1 | 2 | 3,
  seats: Seat[],
  owned: BoonId[],
  reprieve: number,
): string {
  const rivals = seats.filter((seat) => seat.id !== "player");
  const cards = rivals
    .map((seat) => {
      const king = seat.role === "king" ? diamondMark(12) : "";
      const scar = seat.scarred ? `<em class="scar">伤疤 · 她记得你的极端数</em>` : "";
      const seen = seat.revealed ? `<em class="seen">层数区间 ${depthBand(seat.depth)}</em>` : "";
      return `<article class="docket-card">
        <div class="portrait-frame portrait-sm">${portraitSVG(seat.look)}</div>
        <div>
          <h3>${king}${esc(seat.name)} <span>${esc(seat.epithet)}</span></h3>
          <p>${esc(seat.bio)}</p>
          ${scar}
          ${seen}
        </div>
      </article>`;
    })
    .join("");
  const ownedLine = owned.length
    ? owned.map((id) => (id === "reprieve" ? `缓刑 ×${reprieve}` : BOON_SHORT[id])).join(" · ")
    : "还没有文书";
  const kicker = trial === 3 ? "第三庭 · 方块王在场" : `第 ${trial} 庭 · 预审`;
  const lede =
    trial === 3
      ? "前两场的人可以带伤疤回来。王只在这一庭进门。他仍按第二层落子，决战不拿一，也不拿一百。"
      : "这一庭没有方块王。先读这四个人的习惯，再决定你要把谁送到 −10。";
  const act = trial === 1 ? "to-seat" : "begin";
  const label = trial === 1 ? "入座" : "开庭";
  return `<section class="brief">
    <header class="scene-head">
      <p class="eyebrow"><span class="latin">Docket</span> · ${kicker}</p>
      <h2>${trial === 3 ? "王的庭" : "整备"}</h2>
      <p class="lede">${lede}</p>
      <p class="boon-line">身上的文书：${esc(ownedLine)}</p>
    </header>
    <div class="docket">${cards}</div>
    <div class="ceremony-actions"><button type="button" class="btn" data-act="${act}">${label}</button></div>
  </section>`;
}
