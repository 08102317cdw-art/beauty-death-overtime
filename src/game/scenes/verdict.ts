import { thoughtLine, modeLabel, CLAUSES, flourishLine } from "../content/copy";
import { converge } from "../systems/contest";
import type { ClauseId, Flourish, RoundOutcome, Seat } from "../types";
import { esc, fixed, scoreText } from "../ui/format";

export function renderVerdict(
  seats: Seat[],
  outcome: RoundOutcome,
  round: number,
  trial: 1 | 2 | 3,
  duel: boolean,
  fresh: ClauseId[],
  playerAlive: boolean,
  onlyPlayer: boolean,
  flourish: Flourish | null,
  note: string,
): string {
  const rows = seats
    .map((seat) => {
      const row = outcome.rows.find((item) => item.id === seat.id);
      if (!row) return "";
      const spiked = seat.role === "chaos" && row.number !== null && row.number !== converge(0);
      const flag =
        row.voidReason === "timeout" ? "作废" : row.voidReason === "duplicate" ? "无效" : outcome.winnerIds.includes(seat.id) ? "胜" : "";
      const gone = outcome.eliminatedIds.includes(seat.id);
      return `<li class="${outcome.winnerIds.includes(seat.id) ? "is-win" : ""} ${gone ? "is-out" : ""}">
        <span class="who">${esc(seat.name)}</span>
        <b class="latin">${row.number === null ? "—" : row.number}</b>
        <em>${flag}</em>
        <span class="delta">${row.delta === 0 ? "0" : scoreText(row.delta)}</span>
        <small>${esc(thoughtLine(seat, row.number, duel, spiked))}</small>
      </li>`;
    })
    .join("");

  const freshHtml = fresh
    .map((id) => `<p class="fresh">${CLAUSES[id].kicker}　${CLAUSES[id].title}。${CLAUSES[id].text}</p>`)
    .join("");
  const deaths = outcome.eliminatedIds
    .map((id) => seats.find((seat) => seat.id === id))
    .filter((seat): seat is Seat => Boolean(seat))
    .map((seat) => {
      if (seat.role === "king") return "方块王先离开天平。他没有争，像是终于可以把公平放下。";
      return `${seat.name}的名字被溶掉了。王水收回瓶子，文书上只剩一个空格。`;
    });

  let next = "下一轮";
  let act = "next";
  if (!playerAlive) {
    next = "阅读终局文书";
    act = "ending";
  } else if (onlyPlayer && trial === 3) {
    next = "接受加冕";
    act = "ending";
  } else if (onlyPlayer) {
    next = "前往场间";
    act = "reward";
  } else if (fresh.length) {
    next = "消化新条款 · 五分钟";
  }

  const stampClass = flourish === "exact" || flourish === "counter" ? "stamp-gold" : "";
  return `<section class="verdict ${flourish ? `flourish-${flourish}` : ""}">
    <header class="scene-head">
      <p class="eyebrow">第 ${trial} 庭 · 第 ${round} 轮 · ${modeLabel(outcome.mode)}</p>
      <div class="res-title">
        <h2>${outcome.winnerIds.length ? "目标已落" : "本轮无胜者"}</h2>
        <div class="stamp ${stampClass}">${flourish === "counter" ? "反杀" : modeLabel(outcome.mode)}</div>
      </div>
    </header>
    ${flourish ? `<p class="flourish-line">${flourishLine(flourish)}</p>` : ""}
    ${note ? `<p class="flourish-line">${esc(note)}</p>` : ""}
    <div class="target-block">
      <div><span>平均</span><b class="latin">${fixed(outcome.average)}</b></div>
      <div><span>× 0.8</span><b class="latin">${fixed(outcome.target)}</b></div>
      <div><span>四舍五入</span><b class="latin">${outcome.rounded === null ? "—" : outcome.rounded}</b></div>
    </div>
    <ol class="verdict-list">${rows}</ol>
    ${deaths.map((line) => `<p class="death-line">${esc(line)}</p>`).join("")}
    ${freshHtml}
    <div class="ceremony-actions"><button type="button" class="btn" data-act="${act}">${next}</button></div>
  </section>`;
}
