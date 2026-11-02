import type { Look } from "../types";

function hairBack(look: Look): string {
  const fill = look.hairColor;
  switch (look.hair) {
    case "bob":
      return `<ellipse cx="80" cy="92" rx="52" ry="64" fill="${fill}"/>`;
    case "long":
      return `<g fill="${fill}"><ellipse cx="80" cy="78" rx="46" ry="52"/><path d="M34 96c-8 48-4 110 10 124h18c-8-46-6-86 2-112z"/><path d="M126 96c8 48 4 110-10 124h-18c8-46 6-86-2-112z"/></g>`;
    case "updo":
      return `<g fill="${fill}"><ellipse cx="80" cy="34" rx="20" ry="15"/><ellipse cx="80" cy="72" rx="44" ry="42"/><rect x="70" y="18" width="8" height="18" rx="2" fill="${look.metal}" opacity="0.85"/></g>`;
    case "veil":
      return `<g><path d="M48 86C62 18 98 16 114 86l22 132H28z" fill="${fill}" opacity="0.55"/><ellipse cx="80" cy="74" rx="42" ry="38" fill="${fill}"/></g>`;
    case "crop":
      return `<ellipse cx="80" cy="64" rx="42" ry="30" fill="${fill}"/>`;
    case "wave":
      return `<g fill="${fill}"><ellipse cx="80" cy="80" rx="48" ry="56"/><path d="M30 108c-6 40 0 90 14 112h16c-10-40-8-78 0-104z"/><path d="M128 100c10 36 6 96-8 120h-16c8-44 6-84-2-112z"/></g>`;
  }
}

function hairFront(look: Look): string {
  if (!look.coverEye) return "";
  return `<path d="M48 68C26 108 32 154 54 176 62 142 56 108 70 84 60 74 52 68 48 68Z" fill="${look.hairColor}"/>`;
}

function mark(look: Look): string {
  switch (look.mark) {
    case "mole":
      return `<circle cx="104" cy="114" r="1.5" fill="#140c0c"/>`;
    case "earring":
      return `<g stroke="${look.metal}" fill="none" stroke-width="1"><circle cx="114" cy="108" r="3.4"/><circle cx="114" cy="111.6" r="0.7" fill="${look.metal}" stroke="none"/></g>`;
    case "tear":
      return `<path d="M106 98c2 8 0 16 4 26" fill="none" stroke="${look.lip}" stroke-width="0.9" opacity="0.85"/>`;
    case "scar":
      return `<path d="M98 104 l12 10" fill="none" stroke="#f3ecdf" stroke-width="0.7" opacity="0.55"/>`;
    case "none":
      return "";
  }
}

function mouth(look: Look): string {
  if (look.smile) {
    return `<path d="M64 122c10 9 22 9 32 0-8 10-24 10-32 0Z" fill="${look.lip}"/>`;
  }
  return `<path d="M66 122c8 4 20 4 28 0-8 5-20 5-28 0Z" fill="${look.lip}"/>`;
}

export function portraitSVG(look: Look): string {
  const eyes = look.coverEye
    ? `<rect x="92" y="93.2" width="15" height="1.35" fill="#f4efe6"/>`
    : `<rect x="56" y="92" width="15" height="1.35" fill="#f4efe6"/><rect x="90" y="93.4" width="15" height="1.35" fill="#f4efe6"/>`;
  return `<svg class="portrait" viewBox="0 0 160 220" role="img" aria-hidden="true">
    <g class="face">
    <rect width="160" height="220" fill="${look.wash}"/>
    ${hairBack(look)}
    <path d="M66 136l-8 34h44l-8-34z" fill="#241c19"/>
    <ellipse cx="80" cy="98" rx="34" ry="43" fill="#2b221f"/>
    <ellipse cx="92" cy="102" rx="18" ry="28" fill="#5c463f" opacity="0.28"/>
    <path d="M48 96c2-28 14-46 32-48 2 20 2 48 0 70-18-2-30-8-32-22z" fill="#140e0c" opacity="0.38"/>
    ${eyes}
    <path d="M54 78c8-5 16-4 22 1" fill="none" stroke="#120c0b" stroke-width="1.3"/>
    <path d="M86 79c8-5 16-3 22 2" fill="none" stroke="#120c0b" stroke-width="1.3"/>
    <path d="M80 108 v8" stroke="#f3ecdf" stroke-width="0.6" opacity="0.28"/>
    ${mouth(look)}
    ${mark(look)}
    ${hairFront(look)}
    <path d="M18 176c28-22 96-22 124 0l8 44H12z" fill="#0c0a0a"/>
    <path d="M62 164 L80 190 L98 164" fill="none" stroke="${look.metal}" stroke-width="1"/>
    <rect x="7" y="7" width="146" height="206" fill="none" stroke="${look.metal}" stroke-width="0.6" opacity="0.55"/>
    </g>
    <path class="crack" d="M12 18 L68 86 L46 108 L148 206" fill="none" stroke="#c73e4a" stroke-width="1.4"/>
  </svg>`;
}
