import type { Suit } from "../types";

const HEART = `<path fill="currentColor" d="M16 28C16 28 3.5 18.2 3.5 11.2 3.5 6.4 7.2 3.2 11.4 5.1 13.4 6 15 8.2 16 10.2 17 8.2 18.6 6 20.6 5.1 24.8 3.2 28.5 6.4 28.5 11.2 28.5 18.2 16 28 16 28Z"/>`;
const DIAMOND = `<path fill="currentColor" d="M16 1.8 30.2 16 16 30.2 1.8 16Z"/>`;
const CLUB = `<g fill="currentColor"><circle cx="16" cy="9" r="5.2"/><circle cx="9.2" cy="16.6" r="5.2"/><circle cx="22.8" cy="16.6" r="5.2"/><path d="M13.6 18.5h4.8L20.2 29h-8.4z"/></g>`;
const SPADE = `<g fill="currentColor"><path d="M16 2.2C16 2.2 3.2 13.2 3.2 19.6c0 4.2 3.3 7 6.6 6.2 1.7-.4 2.8-1.8 3.6-3.4.7 1.8 1.6 3.6 3.5 4 3.4.8 6.7-2 6.7-6.2C23.6 13.2 16 2.2 16 2.2Z"/><path d="M13.7 23.2h4.6L20 30h-8z"/></g>`;

const PATHS: Record<Suit, string> = {
  spades: SPADE,
  hearts: HEART,
  diamonds: DIAMOND,
  clubs: CLUB,
};

export function suitMark(suit: Suit, size = 28): string {
  return `<svg class="suit-mark suit-${suit}" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${PATHS[suit]}</svg>`;
}

export function heraldicRose(): string {
  return `<svg class="rose" viewBox="0 0 64 78" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1">
      <circle cx="32" cy="26" r="6.5"/>
      <circle cx="32" cy="12" r="7"/>
      <circle cx="44" cy="20" r="7"/>
      <circle cx="40" cy="34" r="7"/>
      <circle cx="24" cy="34" r="7"/>
      <circle cx="20" cy="20" r="7"/>
    </g>
    <path d="M32 40 V72" fill="none" stroke="currentColor" stroke-width="1"/>
    <path d="M32 58 L24 50" fill="none" stroke="#9a2433" stroke-width="1"/>
  </svg>`;
}

export function sealMarkup(): string {
  return `<div class="seal" aria-hidden="true">
    <svg class="seal-ring" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="0.6"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="#9a2433" stroke-width="0.6"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" stroke-width="0.35" stroke-dasharray="1.5 4"/>
    </svg>
    <div class="seal-core">
      <span class="latin">pageant</span>
      <strong>入境</strong>
      <span class="latin seal-over">overtime</span>
      ${heraldicRose()}
    </div>
  </div>`;
}

export function crownMarkup(): string {
  return `<svg class="crown" viewBox="0 0 160 70" aria-hidden="true">
    <path class="crown-line" d="M10 54 L28 20 L52 42 L80 8 L108 42 L132 20 L150 54"/>
    <path class="crown-line" d="M10 54 H150"/>
    <circle cx="80" cy="8" r="2.2" fill="#9a2433" stroke="none"/>
    <circle cx="28" cy="20" r="1.6" fill="#d9d0bc" stroke="none"/>
    <circle cx="132" cy="20" r="1.6" fill="#d9d0bc" stroke="none"/>
  </svg>`;
}

export function muteIcon(muted: boolean): string {
  if (muted) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l4-3v12l-4-3H4V9z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.2"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l4-3v12l-4-3H4V9z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M16 9c1.4 1.2 1.4 4.8 0 6M18.5 7c2.2 2 2.2 8 0 10" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
}
