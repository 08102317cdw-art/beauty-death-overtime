import type { Seat } from "../types";
import { esc, scoreText } from "./format";
import { diamondMark } from "./ornaments";
import { portraitSVG } from "./portrait";

export function bench(seats: Seat[]): string {
  const pans = seats
    .map((seat) => {
      const drop = seat.alive ? Math.min(10, -seat.score) * 4.2 : 46;
      const king = seat.role === "king" ? diamondMark(12) : "";
      return `<div class="pan ${seat.alive ? "" : "is-out"} ${seat.id === "player" ? "is-you" : ""}" style="--drop:${drop}px">
        <div class="chain"></div>
        <div class="portrait-frame portrait-sm ${seat.alive ? "" : "is-dead"} ${seat.id === "player" ? "is-player" : ""}">${portraitSVG(seat.look)}</div>
        <div class="pan-name">${king}${esc(seat.name)}</div>
        <div class="pan-role">${esc(seat.epithet)}</div>
        <b class="latin pan-score">${seat.alive ? scoreText(seat.score) : "除名"}</b>
      </div>`;
    })
    .join("");
  return `<div class="bench" aria-label="天平">${pans}</div>`;
}
