import type { Contestant, Look, Personality } from "../types";

export interface ContestantTemplate {
  id: string;
  name: string;
  epithet: string;
  bio: string;
  personality: Personality;
  personalityLabel: string;
  look: Look;
  popularity: number;
  acting: number;
  dirt: number;
}

export const PERSONALITY_LABEL: Record<Personality, string> = {
  clout: "流量",
  craft: "实力",
  schemer: "心机",
  saint: "温水",
};

export const PLAYER_TEMPLATE: ContestantTemplate = {
  id: "player",
  name: "七号",
  epithet: "未具名",
  bio: "表格上写着待定。委员会喜欢待定的人，因为待定的讣告更好填。",
  personality: "craft",
  personalityLabel: "选手",
  look: {
    hair: "crop",
    mark: "earring",
    hairColor: "#2a2422",
    lip: "#c48b8f",
    wash: "#100c0c",
    metal: "#d9d0bc",
    smile: false,
    coverEye: false,
  },
  popularity: 58,
  acting: 66,
  dirt: 22,
};

export const RIVALS: ContestantTemplate[] = [
  {
    id: "baici",
    name: "白瓷",
    epithet: "笑唇校准",
    bio: "微笑的弧度经过三家诊所，误差小于一度。她不说话时，弹幕会替她说话。",
    personality: "clout",
    personalityLabel: "流量",
    look: {
      hair: "bob",
      mark: "mole",
      hairColor: "#efeae4",
      lip: "#8f2433",
      wash: "#141210",
      metal: "#d9d0bc",
      smile: true,
      coverEye: false,
    },
    popularity: 84,
    acting: 38,
    dirt: 14,
  },
  {
    id: "lengyin",
    name: "冷银",
    epithet: "定格遗像",
    bio: "每个停顿都像在给自己拍遗像，而且光比是对的。评委想把话筒焊在她手上。",
    personality: "craft",
    personalityLabel: "实力",
    look: {
      hair: "updo",
      mark: "earring",
      hairColor: "#c5c8ce",
      lip: "#6e2430",
      wash: "#0e1014",
      metal: "#c5c8ce",
      smile: false,
      coverEye: false,
    },
    popularity: 44,
    acting: 88,
    dirt: 11,
  },
  {
    id: "jiangsha",
    name: "绛纱",
    epithet: "亚军专业户",
    bio: "上一季的亚军。在这栋楼里，亚军是一种死因的正式名称。",
    personality: "schemer",
    personalityLabel: "心机",
    look: {
      hair: "wave",
      mark: "tear",
      hairColor: "#3a1018",
      lip: "#c73e4a",
      wash: "#14080a",
      metal: "#d9d0bc",
      smile: false,
      coverEye: true,
    },
    popularity: 63,
    acting: 61,
    dirt: 47,
  },
  {
    id: "mila",
    name: "蜜蜡",
    epithet: "温水",
    bio: "会把水递给你。水是温的。温水在这里通常有第二用途。",
    personality: "saint",
    personalityLabel: "温水",
    look: {
      hair: "long",
      mark: "earring",
      hairColor: "#8a5a32",
      lip: "#a65458",
      wash: "#14100c",
      metal: "#e0c28a",
      smile: true,
      coverEye: false,
    },
    popularity: 54,
    acting: 58,
    dirt: 5,
  },
  {
    id: "shuangtong",
    name: "霜桐",
    epithet: "古典刀",
    bio: "古典舞出身。评委说她的线条很干净。线条干净的人，切割时也干净。",
    personality: "craft",
    personalityLabel: "实力",
    look: {
      hair: "veil",
      mark: "none",
      hairColor: "#161418",
      lip: "#9a2433",
      wash: "#0c0c0e",
      metal: "#d9d0bc",
      smile: false,
      coverEye: false,
    },
    popularity: 51,
    acting: 79,
    dirt: 17,
  },
  {
    id: "molian",
    name: "墨莲",
    epithet: "集邮者",
    bio: "收集黑料像集邮。她的本子比你的签证厚，而且每一页都还活着。",
    personality: "schemer",
    personalityLabel: "心机",
    look: {
      hair: "long",
      mark: "scar",
      hairColor: "#140c16",
      lip: "#6a1830",
      wash: "#100c12",
      metal: "#9a2433",
      smile: false,
      coverEye: false,
    },
    popularity: 56,
    acting: 70,
    dirt: 44,
  },
];

export function coachLine(c: Contestant): string {
  if (c.dirt >= 34) return "黑料已经厚过妆。它可以当武器，也可以当悼词。";
  if (c.acting >= c.popularity + 12) return "你的技术比脸亮。只认脸的规则，会让你吃亏。";
  if (c.popularity >= c.acting + 12) return "你靠气场活着。气场一旦被规则点名，就会变成把柄。";
  if (c.dirt <= 12) return "你很干净。干净的人被造谣时，观众偶尔会心软。";
  return "你中等，未完成，还可以被写成任何结局。这是未具名选手的特权，也是风险。";
}

export function materialize(
  template: ContestantTemplate,
  stats: { popularity: number; acting: number; dirt: number },
  nameOverride?: string,
): Contestant {
  return {
    id: template.id,
    name: nameOverride ?? template.name,
    epithet: template.epithet,
    bio: template.bio,
    personality: template.personality,
    personalityLabel: template.personalityLabel,
    look: template.look,
    isPlayer: template.id === "player",
    popularity: stats.popularity,
    acting: stats.acting,
    dirt: stats.dirt,
    alive: true,
    overexposed: false,
  };
}
