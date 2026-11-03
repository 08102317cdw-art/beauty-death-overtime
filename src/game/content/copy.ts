import type { ClauseId, RoundMode, Seat } from "../types";

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
  if (seat.role === "king" && duel) return "他按第二层落子。一是谋杀，一百是陷阱，他两个都不拿。";
  if (seat.role === "king") return "第二层。公平只乘到这里。";
  if (seat.role === "rational") return "她只乘了一次。";
  if (seat.role === "deep") return "第三层。再往下她觉得是零，而零太吵。";
  if (seat.role === "chaos" && spiked) return "这一轮她把平均掀翻了。";
  if (seat.role === "chaos") return "她停在别人的第一眼。";
  return "你的数字。";
}
