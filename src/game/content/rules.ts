import type { RuleCard, RuleId, Suit } from "../types";

export interface SuitInfo {
  id: Suit;
  mark: string;
  name: string;
  domain: string;
  pitch: string;
  visa: string;
}

export const SUITS: Record<Suit, SuitInfo> = {
  spades: {
    id: "spades",
    mark: "♠",
    name: "黑桃",
    domain: "肉体",
    pitch: "灯只承认还站着的人。",
    visa: "评委会不看你的心。灯越热，分越高；空着，就算退赛。",
  },
  hearts: {
    id: "hearts",
    mark: "♥",
    name: "红心",
    domain: "人心",
    pitch: "这里投票的不是审美，是谁先露破绽。",
    visa: "笑容、黑料、观众的嘴。你的武器和伤口是同一块皮肤。",
  },
  diamonds: {
    id: "diamonds",
    mark: "♦",
    name: "方块",
    domain: "规则",
    pitch: "分数会说话。今晚有一句是假的。",
    visa: "读得懂的人活着。读得太顺的人，会被当成已经服从。",
  },
  clubs: {
    id: "clubs",
    mark: "♣",
    name: "梅花",
    domain: "同盟",
    pitch: "必须伸手。加时赛会问你这只手还要不要。",
    visa: "盟约能免掉一笔死，也能写成动机。",
  },
};

export const SUIT_ORDER: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export const RULES: Record<RuleId, RuleCard> = {
  lens_hunger: {
    id: "lens_hunger",
    name: "镜头饥饿",
    suit: "spades",
    kicker: "黑桃 · 肉体",
    text: "开场的镜头不等人。你要么把脸放进去，要么把技术放进去。翻黑料、借光、发呆，都会被记成空镜。空镜在黑桃里不叫留白，叫缺血。",
    plain: "走位选「卖相」或「才艺」。选「翻黑料」或「借光」：人气项作废，并再罚一笔。",
  },
  hot_light: {
    id: "hot_light",
    name: "热灯",
    suit: "spades",
    kicker: "黑桃 · 过曝",
    text: "灯温会计入评分。把脸交给灯的人会很亮。人气已经很高还继续卖相，会过曝——这一幕更耀眼，加时赛脸上有一层洗不掉的灰。",
    plain: "「卖相」额外加分。人气极高者再亮一档，但加时赛承受过曝罚分。",
  },
  smile_tax: {
    id: "smile_tax",
    name: "微笑税",
    suit: "hearts",
    kicker: "红心 · 笑容",
    text: "标准的笑有奖金。奖金按黑料打折：你越脏，这张笑就越像供词。脏得太厉害还去笑，多半是亏的。",
    plain: "「卖相」获得微笑奖金，并按自己的黑料扣减。黑料越重，笑容越不划算。",
  },
  dirt_window: {
    id: "dirt_window",
    name: "黑料兑换",
    suit: "hearts",
    kicker: "红心 · 自白",
    text: "本幕开放自白。自己把伤疤揭开，委员会给兑换分，并替你擦掉一层黑料。被别人当众揭开的，按加码疼。",
    plain: "「翻黑料」额外加分，并降低黑料。若本幕有人放你的风，再受一笔重罚。",
  },
  public_lie: {
    id: "public_lie",
    name: "公示的谎",
    suit: "diamonds",
    kicker: "方块 · 读谎",
    text: "你的签证上印着一条金色建议，在「卖相」和「才艺」之间。那是谎。委员会喜欢服从的人，尤其喜欢服从得整整齐齐的错误。",
    plain: "不要选带「公示建议」的那一项。改选另一项（卖相或才艺）有读谎的奖。选中金色会受罚。翻黑料与借光不参与这场对赌。",
  },
  silence_prize: {
    id: "silence_prize",
    name: "沉默金奖",
    suit: "diamonds",
    kicker: "方块 · 留白",
    text: "这一幕，不说话很贵。超时的沉默不算留白，那叫弃权。弃权是另一种死法。",
    plain: "「沉默」额外加分。超时被锁死的选择不算沉默。",
  },
  handshake: {
    id: "handshake",
    name: "拉手协议",
    suit: "clubs",
    kicker: "梅花 · 伸手",
    text: "协议要你自己的手。别人来握你，只说明你受欢迎，不算完成。没有伸出手的人，总分打折。双向握住的人，另有一笔安稳。",
    plain: "在「人心」里选择结盟并指向某人，否则总分七五折。双向盟约另有加分。「借光」在有盟约时更亮。",
  },
  chain_letter: {
    id: "chain_letter",
    name: "血盟预告",
    suit: "clubs",
    kicker: "梅花 · 连坐",
    text: "这一幕的握手很甜。双向盟约会得一笔甜分，并带进加时赛。加时赛只留一张脸。甜的那只手，到时候会问你还要不要。",
    plain: "双向结盟额外加分，并结成血盟。加时赛会来结账：背刺很赚，留下只有安稳分，安稳不一定够活。",
  },
  showdown_dirt: {
    id: "showdown_dirt",
    name: "黑料摊牌",
    suit: "overtime",
    kicker: "加时 · 摊牌",
    text: "所有妆被卸掉。黑料按重量往下拖。愿意当众翻开它的人，能把重量短暂地变成武器。",
    plain: "不翻黑料就按黑料重罚。选择「翻黑料」，黑料改为加分。加时赛只留第一名。",
  },
  the_dogs: {
    id: "the_dogs",
    name: "观众是群狗",
    suit: "overtime",
    kicker: "加时 · 喂食",
    text: "观众票权重翻倍。你喂他们，他们就响；你咬错人，他们也响。响是中性的，活不是。",
    plain: "演讲、买票、放风、沉默的观众分全部翻倍。放风若咬到干净的人，反咬也翻倍。只留第一名。",
  },
  epitaph_clock: {
    id: "epitaph_clock",
    name: "墓志铭时钟",
    suit: "overtime",
    kicker: "加时 · 超时",
    text: "超时的人会被写成弃权。弃权在加时赛等于自拟墓志铭，而且名次永远排在所有按时交卷的人后面。",
    plain: "超时重罚，并且排名低于一切未超时的人。请在灯灭前做完三拍。只留第一名。",
  },
  blood_due: {
    id: "blood_due",
    name: "血盟兑现",
    suit: "overtime",
    kicker: "加时 · 结账",
    text: "上一幕的手还在台上。背刺旧盟友会得到一笔脏分；留着对方，只有安稳。加时赛只签发一张存活签证，安稳通常不够付账。",
    plain: "与旧盟友双向握过的人：背刺他们获高额加分；不背刺只有一小笔安稳分。没有旧盟，按普通人心结算。只留第一名。",
  },
};

export const SUIT_RULES: Record<Suit, RuleId[]> = {
  spades: ["lens_hunger", "hot_light"],
  hearts: ["smile_tax", "dirt_window"],
  diamonds: ["public_lie", "silence_prize"],
  clubs: ["handshake", "chain_letter"],
};

export const OVERTIME_RULES: RuleId[] = ["showdown_dirt", "the_dogs", "epitaph_clock"];

export const STRATEGY_COPY: Record<
  "glamour" | "craft" | "scandal" | "borrow",
  { name: string; desc: string }
> = {
  glamour: {
    name: "卖相",
    desc: "把脸交给灯。人气高的人，这盏灯更听话。",
  },
  craft: {
    name: "才艺",
    desc: "用技术把时间占满。演技是你还站着的理由。",
  },
  scandal: {
    name: "翻黑料",
    desc: "自己把伤疤揭开。不够深，就像求饶；够深，才像武器。",
  },
  borrow: {
    name: "借光",
    desc: "站进盟约的影子里。没有手，你只是在抓空气。",
  },
};

export const AUDIENCE_COPY: Record<
  "speech" | "bribe" | "rumor" | "silence",
  { name: string; desc: string }
> = {
  speech: {
    name: "演讲",
    desc: "给观众一个可以哭的理由。人气会帮你把句子送出去。",
  },
  bribe: {
    name: "买票",
    desc: "让提词员替你说话。很有效。总有人看见钱，钱会变成黑料。",
  },
  rumor: {
    name: "放风",
    desc: "把一根刺放进别人的花里。扎到干净的人，观众会反过来咬你。",
  },
  silence: {
    name: "沉默",
    desc: "不给评语。演技好的人像留白，演技差的人像忘词。",
  },
};

export const SOCIAL_COPY = {
  ally: {
    name: "结盟",
    desc: "把手递出去。双向握住才是盟。单方面，只算你伸过。",
  },
  betray: {
    name: "背刺",
    desc: "只有盟约才值得背叛。没有盟的刀，看起来像慌。",
  },
  abstain: {
    name: "旁观",
    desc: "把手收回袖子。安全，也孤单。",
  },
};

export function decisionLabel(
  kind: string,
  targetName?: string | null,
): string {
  const map: Record<string, string> = {
    glamour: "卖相",
    craft: "才艺",
    scandal: "翻黑料",
    borrow: "借光",
    freeze: "发呆",
    speech: "演讲",
    bribe: "买票",
    rumor: "放风",
    silence: "沉默",
    ally: "结盟",
    betray: "背刺",
    abstain: "旁观",
  };
  const base = map[kind] ?? kind;
  if ((kind === "rumor" || kind === "ally" || kind === "betray") && targetName) {
    return `${base}·${targetName}`;
  }
  return base;
}
