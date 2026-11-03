import type { Look, Seat } from "../types";

export interface RivalTemplate {
  id: string;
  name: string;
  epithet: string;
  role: Seat["role"];
  depth: Seat["depth"];
  bio: string;
  look: Look;
}

const playerLook: Look = {
  hair: "crop",
  mark: "earring",
  hairColor: "#2a2422",
  lip: "#c48b8f",
  wash: "#100c0c",
  metal: "#d9d0bc",
  smile: false,
  coverEye: false,
};

const kingLook: Look = {
  hair: "updo",
  mark: "none",
  hairColor: "#12141a",
  lip: "#5c1c28",
  wash: "#0c0e12",
  metal: "#d9d0bc",
  smile: false,
  coverEye: false,
};

const rationalLook: Look = {
  hair: "bob",
  mark: "mole",
  hairColor: "#efeae4",
  lip: "#8f2433",
  wash: "#141210",
  metal: "#d9d0bc",
  smile: true,
  coverEye: false,
};

const deepLook: Look = {
  hair: "veil",
  mark: "none",
  hairColor: "#161418",
  lip: "#9a2433",
  wash: "#0c0c0e",
  metal: "#d9d0bc",
  smile: false,
  coverEye: false,
};

const chaosLook: Look = {
  hair: "wave",
  mark: "tear",
  hairColor: "#3a1018",
  lip: "#c73e4a",
  wash: "#14080a",
  metal: "#d9d0bc",
  smile: false,
  coverEye: true,
};

export function createSeats(playerName: string): Seat[] {
  const name = playerName.trim().slice(0, 8) || "七号";
  return [
    {
      id: "player",
      name,
      epithet: "未具名",
      role: "player",
      depth: 0,
      bio: "案卷上的名字可以改。分数不行。",
      look: playerLook,
      score: 0,
      alive: true,
      scarred: false,
      revealed: false,
    },
    {
      id: "king",
      name: "方块王",
      epithet: "衡平",
      role: "king",
      depth: 2,
      bio: "他把公平说得很慢。慢，是因为他真的打算照做。",
      look: kingLook,
      score: 0,
      alive: true,
      scarred: false,
      revealed: false,
    },
    {
      id: "baici",
      name: "白瓷",
      epithet: "一层",
      role: "rational",
      depth: 1,
      bio: "她只把平均乘一次。再往下，她认为是别人的事。",
      look: rationalLook,
      score: 0,
      alive: true,
      scarred: false,
      revealed: false,
    },
    {
      id: "lengyin",
      name: "冷银",
      epithet: "深算",
      role: "deep",
      depth: 3,
      bio: "八成，再八成，再八成。她停在第三层，像停在一道算完的墓志铭上。",
      look: deepLook,
      score: 0,
      alive: true,
      scarred: false,
      revealed: false,
    },
    {
      id: "jiangsha",
      name: "绛纱",
      epithet: "搅局",
      role: "chaos",
      depth: 0,
      bio: "她多数时候停在别人的第一眼。偶尔，她把桌子掀了。",
      look: chaosLook,
      score: 0,
      alive: true,
      scarred: false,
      revealed: false,
    },
  ];
}

const mirrorLook: Look = {
  hair: "long",
  mark: "none",
  hairColor: "#1c1a1a",
  lip: "#9a2433",
  wash: "#0e0c0c",
  metal: "#d9d0bc",
  smile: false,
  coverEye: false,
};

const conformLook: Look = {
  hair: "long",
  mark: "earring",
  hairColor: "#8a5a32",
  lip: "#a65458",
  wash: "#14100c",
  metal: "#e0c28a",
  smile: true,
  coverEye: false,
};

const grudgeLook: Look = {
  hair: "long",
  mark: "scar",
  hairColor: "#140c16",
  lip: "#6a1830",
  wash: "#100c12",
  metal: "#9a2433",
  smile: false,
  coverEye: false,
};

export const RIVALS: RivalTemplate[] = [
  {
    id: "baici",
    name: "白瓷",
    epithet: "一层",
    role: "rational",
    depth: 1,
    bio: "她只把平均乘一次。再往下，她认为是别人的事。",
    look: rationalLook,
  },
  {
    id: "lengyin",
    name: "冷银",
    epithet: "深算",
    role: "deep",
    depth: 3,
    bio: "八成，再八成，再八成。她停在第三层，像停在一道算完的墓志铭上。",
    look: deepLook,
  },
  {
    id: "jiangsha",
    name: "绛纱",
    epithet: "搅局",
    role: "chaos",
    depth: 0,
    bio: "她多数时候停在别人的第一眼。偶尔，她把桌子掀了。",
    look: chaosLook,
  },
  {
    id: "shuangtong",
    name: "霜桐",
    epithet: "镜像",
    role: "mirror",
    depth: 1,
    bio: "她不发明数字。她抄你上一轮写下的那个。",
    look: mirrorLook,
  },
  {
    id: "mila",
    name: "蜜蜡",
    epithet: "同温",
    role: "conform",
    depth: 1,
    bio: "她坐在别人的中间。房间是什么温度，她就是什么温度。",
    look: conformLook,
  },
  {
    id: "molian",
    name: "墨莲",
    epithet: "记恨",
    role: "grudge",
    depth: 2,
    bio: "平时她乘到第二层。被极端数坑过之后，她会专门对着你来。",
    look: grudgeLook,
  },
  {
    id: "king",
    name: "方块王",
    epithet: "衡平",
    role: "king",
    depth: 2,
    bio: "他把公平说得很慢。第三庭他才进门，决战里不拿一，也不拿一百。",
    look: kingLook,
  },
];

export function seatFrom(template: RivalTemplate, scarred: boolean, revealed: boolean): Seat {
  return {
    ...template,
    score: 0,
    alive: true,
    scarred,
    revealed,
    look: { ...template.look },
  };
}
