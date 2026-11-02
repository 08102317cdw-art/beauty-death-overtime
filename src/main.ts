import "./style.css";
import { Game } from "./game/app";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("missing #app");
new Game(root);
