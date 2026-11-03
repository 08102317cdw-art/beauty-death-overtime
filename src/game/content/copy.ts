import type { BoonId, ClauseId, Flourish, RoundMode, Seat } from "../types";

export const BASE_ARTICLES = [
  {
    kicker: "第一条",
    title: "选数",
    text: "五人各在时限内选择一个从 0 到 100 的整数。本院不评选容貌。",
  },
  {
    kicker: "第二条",
    title: "目标",
    text: "公布全部有效数字，取平均，再乘以 0.8。所得即为本轮目标值。",
  },
  {
    kicker: "第三条",
    title: "胜负",
    text: "与目标值最接近者，分数不动。其余每人 −1。并列最接近者，均不扣分。",
  },
  {
    kicker: "第四条",
    title: "除名",
    text: "分数降至 −10 或更低，即刻除名。除名是一纸文书。王水只溶名字。",
  },
];

export const CLAUSES: Record<
  ClauseId,
  { kicker: string; title: string; text: string }
> = {
  duplicate: {
    kicker: "条款甲",
    title: "同数无效",
    text: "已有一人除名。若两人及以上选择同一整数，该整数无效：不计入平均，不能取胜，选择者仍然扣分。",
  },
  exact: {
    kicker: "条款乙",
    title: "精确命中",
    text: "已有两人除名。若某人的整数与目标值四舍五入后的整数一致，即为精确命中。命中者不扣分，其余每人 −2。超时者仍只扣 1 分。",
  },
  duel: {
    kicker: "条款丙",
    title: "零与一百",
    text: "只剩两人。若有人选 0，则选 100 者直接胜出本轮。",
  },
};

export const TIMEOUT_LINE = "时限内未落子者，本轮数字作废，并扣 1 分。";

export function clauseOrder(active: ClauseId[]): ClauseId[] {
  return (["duplicate", "exact", "duel"] as ClauseId[]).filter((id) => active.includes(id));
}

export function modeLabel(mode: RoundMode): string {
  if (mode === "exact") return "精确命中";
  if (mode === "duel") return "一百直接胜";
  if (mode === "none") return "无人有效";
  return "最接近";
}

export function thoughtLine(seat: Seat, number: number | null, duel: boolean, spiked: boolean): string {
  if (number === null) return "数字作废。";
  const scar = seat.scarred ? "伤疤还在。" : "";
  if (seat.role === "king" && duel) return "他按第二层落子。一是谋杀，一百是陷阱，他两个都不拿。";
  if (seat.role === "king") return "第二层。公平只乘到这里。";
  if (seat.role === "rational") return seat.scarred ? "她被教过一次，这回乘到第二层。" : "她只乘了一次。";
  if (seat.role === "deep") return seat.scarred ? "深算挪开了。她不肯再坐在你的数字旁边。" : "第三层。再往下她觉得是零，而零太吵。";
  if (seat.role === "chaos" && spiked) return `${scar}这一轮她把平均掀翻了。`.trim();
  if (seat.role === "chaos") return "她停在别人的第一眼。";
  if (seat.role === "mirror") return seat.scarred ? "她还在抄你，但故意偏开一格。" : "她抄的是你上一轮的数字。";
  if (seat.role === "conform") return seat.scarred ? "同温还在，只是她躲开了你站过的地方。" : "她坐在别人的中间。";
  if (seat.role === "grudge") return seat.scarred ? "记恨对准了你。极端数她会还。" : "第二层。恨意还没被点燃。";
  return "你的数字。";
}

export const BOONS: Record<BoonId, { kicker: string; title: string; text: string }> = {
  glimpse: {
    kicker: "信息",
    title: "窥层",
    text: "下一场点明一人的层数区间。不是她的脸，是她会乘到第几层。",
  },
  imprint: {
    kicker: "压分",
    title: "重印",
    text: "你本人精确命中时，其余未超时的人再多扣 1 分。章只盖在精确上，不另造攻击。",
  },
  reprieve: {
    kicker: "生存",
    title: "缓刑",
    text: "一次。超时不扣分，或在同数无效时把你的数字挪开一格。用掉即止，最多攒两次。",
  },
};

export function flourishLine(kind: Flourish): string {
  if (kind === "exact") return "精确命中。文书盖了第二次，金线沿着天平走了一圈。";
  if (kind === "chaos") return "搅局改写了平均。目标不在你算过的那一页上。";
  if (kind === "counter") return "一百反杀零。条款丙亲自盖章。";
  return "危险的人离席。下一场会更好读，或更记恨。";
}
