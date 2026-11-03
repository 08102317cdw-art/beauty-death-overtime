export function diamondMark(size = 16): string {
  return `<svg class="diamond" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 1.8 30.2 16 16 30.2 1.8 16Z"/></svg>`;
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
      <span class="latin">diamond</span>
      <strong>开庭</strong>
      <span class="latin seal-over">0.8</span>
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

export function scalesBeam(): string {
  return `<svg class="beam" viewBox="0 0 1000 72" aria-hidden="true">
    <path d="M100 28 H900" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M500 28 L478 58 H522 Z" fill="currentColor"/>
    <path d="M500 58 V70" stroke="currentColor" stroke-width="1"/>
    <path d="M100 28 V42 M300 28 V42 M500 28 V42 M700 28 V42 M900 28 V42" stroke="currentColor" stroke-width="1"/>
  </svg>`;
}
