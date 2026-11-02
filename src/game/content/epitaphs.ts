import { SUITS } from "./rules";
import type { Contestant, Ending, RoundRecord, Run } from "../types";
import { hashSeed } from "../rng";

const LINES: Record<string, string[]> = {
  timeout: [
    "{name}没有交卷。委员会把空白收成遗物，并感谢其主动让出的呼吸。",
    "灯还亮着的时候，{name}没有选。后来灯觉得自己可以先走。",
  ],
  murder: [
    "{name}的刀比皇冠先到。这栋楼只给第一名留门，凶手走的员工通道是封死的。",
    "背刺很成功。成功不是免死金牌，是一份写得很工整的动机。{name}的动机被盖章归档。",
  ],
  betrayed: [
    "{name}把水喝了。温的。评语只写：信任过度。不影响复赛，因为没有复赛。",
    "盟友的手很稳，稳到能把{name}的名字从存活栏挪到致谢栏。",
  ],
  overexposed: [
    "评语：{name}过曝。观众记得一团光，不记得光里有没有人。",
    "{name}把脸交给灯，灯没有还。灯光师说这叫正常损耗。",
  ],
  empty_frame: [
    "开场的镜头里没有{name}。没有{name}的镜头，后来也没有{name}。",
    "评委以为{name}在留白。留白是艺术，缺血是记录。他们记了后一种。",
  ],
  cheap_shot: [
    "{name}造了一条干净的谣。观众不信，但记住了这双手上有灰。",
    "那一针扎在不该扎的人身上。全场的嘘声很整齐，像事先排练过。{name}被编进了合唱。",
  ],
  obedient: [
    "{name}照做了金色的建议。建议是假的，服从是真的。委员会最喜欢真的错误。",
    "公示栏说往左。{name}往左走。左边是太平间的方向，只是写得很体面。",
  ],
  scandal: [
    "{name}试图自白。内容太少，听起来像一份没写完的检讨，而检讨不是才艺。",
    "{name}的伤疤太浅。浅的伤疤看起来像撒娇，撒娇在这一季已经过季。",
  ],
  generic: [
    "评语：{name}的五官分别都很努力，合在一起像一场事故。",
    "排名不是谋杀。谋杀没有这么公平。灯灭的时候，{name}看起来甚至有点同意。",
    "{name}的表演完成了。完成和活下来，在细则里是两个栏目。",
    "皇冠很有风度，绕开了{name}。它向来不和垫底的人抢路。",
  ],
};

const TAG_PRIORITY = [
  "timeout",
  "murder",
  "betrayed",
  "overexposed",
  "empty_frame",
  "cheap_shot",
  "obedient",
  "scandal",
  "generic",
];

export function epitaphFor(person: Contestant, tags: string[], seed: string): string {
  const tag = TAG_PRIORITY.find((item) => tags.includes(item)) ?? "generic";
  const pool = LINES[tag] ?? LINES.generic;
  const line = pool[hashSeed(`${seed}:${person.id}:${tag}`) % pool.length];
  return line.replaceAll("{name}", person.name);
}

const WIN: Record<Run["suit"], string> = {
  spades:
    "你还站着。在黑桃的房间里，这已经是全部的美学。皇冠递过来的时候是热的，像一盏刚关掉的灯。",
  hearts:
    "你赢了。不是因为他们爱你，是因为他们更想看别人先倒下。签证官把这份恶意盖章，称作人气。",
  diamonds:
    "你读完了规则，并且没有把朗读当成表演。委员会沉默了一小会儿。沉默在方块里很贵。他们把冠军判给了那个让他们亏本的人。",
  clubs:
    "最后一只手是你自己的。你握过别人，也松开过。松开的时机比笑容值钱。皇冠很轻，轻得像一条刚剪断的绳子。",
};

const CODA =
  "下一场在更黑的房间。这顶皇冠是门票，不是奖品。恭喜，你获得了继续害怕的资格。";

const DEATH_CODA =
  "边境选美委员会不接受申诉。家属可在灯光部领取未使用的微笑，逾期作废。";

export function buildEnding(run: Run): Ending {
  const player = run.roster.find((c) => c.isPlayer);
  if (!player) throw new Error("missing player");
  const suitInfo = SUITS[run.suit];
  const last = run.rounds[run.rounds.length - 1];
  const win = player.alive && last?.winner === player.id;

  if (win && last) {
    const fallen = last.eliminated
      .map((id) => run.roster.find((c) => c.id === id)?.name ?? id)
      .join("、");
    return {
      win: true,
      title: "冠军签证",
      epitaph: "存活签证 · 有效期至下一场",
      body: `${WIN[run.suit]}${fallen ? `灯灭的时候，${fallen}还保持着比赛用的表情。委员会称此为统一服装。` : ""}${CODA}`,
      placeLabel: "冠军",
      suit: run.suit,
      seed: run.seed,
      name: player.name,
    };
  }

  const deathRound = [...run.rounds].reverse().find((record) => record.eliminated.includes(player.id));
  const tags = deathRound ? deathRound.scores[player.id]?.tags ?? [] : ["generic"];
  const place = deathRound ? deathRound.ranking.indexOf(player.id) + 1 : 4;
  const placeLabel =
    deathRound?.index === 0 ? "第一幕垫底" : `加时赛第 ${place} 名`;
  const winnerId = run.rounds[1]?.winner;
  const winner = winnerId ? run.roster.find((c) => c.id === winnerId) : undefined;
  const early = deathRound?.index === 0;
  const extra = early
    ? "加时赛没有你的座位。他们会在更热的灯下继续微笑，好像你是一个被剪掉的镜头。"
    : winner
      ? `存活签证在${winner.name}手上。她暂时获得了继续害怕的资格。`
      : "";

  return {
    win: false,
    title: "讣告",
    epitaph: epitaphFor(player, tags, run.seed),
    body: `${extra}${DEATH_CODA}入口是${suitInfo.name}。委员会已将你的编号让给下一位未具名的人。`,
    placeLabel,
    suit: run.suit,
    seed: run.seed,
    name: player.name,
  };
}

export function roundHeadline(record: RoundRecord, run: Run): string {
  if (record.index === 0) {
    const dead = run.roster.find((c) => c.id === record.eliminated[0]);
    return dead ? `${dead.name}的灯被收回。` : "有人离场。";
  }
  if (record.winner) {
    const winner = run.roster.find((c) => c.id === record.winner);
    return winner ? `只留下${winner.name}的脸。` : "只留一张脸。";
  }
  return "灯只留了一张脸。";
}
