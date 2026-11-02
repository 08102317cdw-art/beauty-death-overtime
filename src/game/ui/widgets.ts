import type { Contestant, RuleCard } from "../types";
import { esc } from "./format";
import { portraitSVG } from "./portrait";

export function portraitFrame(person: Contestant, size: "sm" | "md" | "lg", dead = false): string {
  const cls = ["portrait-frame", `portrait-${size}`, dead ? "is-dead" : "", person.isPlayer ? "is-player" : ""]
    .filter(Boolean)
    .join(" ");
  return `<div class="${cls}">${portraitSVG(person.look)}</div>`;
}

export function meters(person: Contestant): string {
  const rows: Array<[string, number, string]> = [
    ["人气", person.popularity, "gold"],
    ["演技", person.acting, "gold"],
    ["黑料", person.dirt, "blood"],
  ];
  return `<div class="meters">${rows
    .map(
      ([label, value, tone]) => `<div class="meter">
        <div class="meter-top"><span>${label}</span><span class="latin">${value}</span></div>
        <div class="meter-track"><div class="meter-fill meter-${tone}" style="width:${Math.max(0, Math.min(100, value))}%"></div></div>
      </div>`,
    )
    .join("")}</div>`;
}

export function ruleCard(rule: RuleCard, extra = ""): string {
  return `<article class="rule-card">
    <p class="rule-kicker"><span class="latin">${esc(rule.kicker)}</span></p>
    <h3>${esc(rule.name)}</h3>
    <p class="rule-text">${esc(rule.text)}</p>
    <p class="plain"><span>执行</span>${esc(rule.plain)}</p>
    ${extra}
  </article>`;
}

export function choiceButton(
  key: string,
  act: string,
  id: string,
  index: string,
  name: string,
  desc: string,
  tag?: { text: string; tone: "gold" | "blood" } | null,
): string {
  const badge = tag ? `<em class="tag tag-${tag.tone}">${esc(tag.text)}</em>` : "";
  return `<button type="button" class="choice" data-act="${act}" data-id="${esc(id)}" data-key="${esc(key)}">
    <span class="idx latin">${esc(index)}</span>
    <span class="choice-body">
      <span class="choice-name">${esc(name)}${badge}</span>
      <span class="choice-desc">${esc(desc)}</span>
    </span>
  </button>`;
}

export function personTag(person: Contestant, dead = false): string {
  return `<div class="person-id">
    <strong>${esc(person.name)}</strong>
    <span>${esc(person.epithet)} · ${esc(person.personalityLabel)}</span>
    ${dead ? `<em class="mini-dead">退场</em>` : ""}
  </div>`;
}
