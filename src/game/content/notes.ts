import { isMutual, partnersOf } from "../systems/pacts";
import type { Run } from "../types";

export function briefingNotes(run: Run, roundIndex: 0 | 1): string[] {
  const player = run.roster.find((c) => c.isPlayer);
  if (!player) return [];
  const notes: string[] = [];
  const rule = roundIndex === 0 ? run.rule1 : run.ruleOT;
  const saint = run.roster.find((c) => c.alive && c.personality === "saint");

  if (roundIndex === 0) {
    if ((rule.id === "handshake" || rule.id === "chain_letter") && saint) {
      notes.push(
        `${saint.name}会向你伸手。握回去是盟；你去握别人，她的手还搭着。加时赛里，这只手会问你还要不要。`,
      );
    } else if (rule.id === "public_lie") {
      notes.push("金色短签是谎。它印在你的签证上，不印在别人的脸上。");
    } else if (rule.id === "lens_hunger") {
      notes.push("空镜会被写成缺血。缺血的人通常不再需要第二幕。");
    } else if (rule.id === "hot_light" && player.popularity >= 72) {
      notes.push("你的人气已经够烫。再卖相，会亮到加时赛还在脱皮。");
    }
    return notes;
  }

  const dead = run.roster.find((c) => !c.alive);
  if (dead) notes.push(`${dead.name}的灯已经收走。编号还贴在台上，像一句被划掉的广告。`);
  if (player.overexposed) notes.push("你的脸还留着过曝的灰。这一轮的灯记得那层灰。");
  const schemer = run.roster.find((c) => c.alive && c.personality === "schemer");
  if (schemer && rule.id === "the_dogs") {
    notes.push(`${schemer.name}会把风放向气场最盛的人。观众翻倍之后，这一口特别响。`);
  }
  if (player.dirt >= 36) notes.push("你的黑料厚得能当第二层妆。摊牌的时候，它会自己上台。");

  const partners = partnersOf(player.id, run.alliances)
    .map((id) => run.roster.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c && c.alive));

  for (const partner of partners) {
    if (isMutual(player.id, partner.id, run.alliances)) {
      notes.push(`你与${partner.name}互相握着。加时赛里，这只手可以变成刀。`);
    } else if (run.alliances.some((p) => p.from === partner.id && p.to === player.id)) {
      notes.push(`${partner.name}的手还搭在你这边。她的微笑不一定还在。`);
    } else {
      notes.push(`你伸向${partner.name}的手还没收。`);
    }
  }

  if (saint && partners.some((p) => p.id === saint.id)) {
    notes.push(`${saint.name}又放了一杯温水。她的另一只手不在桌上。`);
  }

  notes.push("只留第一名。第二名的评语会印在讣告副标题上。");
  return notes;
}
