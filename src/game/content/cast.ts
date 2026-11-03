import type { Look, Seat } from "../types";

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
    },
  ];
}
