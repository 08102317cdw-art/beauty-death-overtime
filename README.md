# 选美：死亡加时赛

这不是选谁好看。这是方块之王的美人投票：五个人各选一个 0 到 100 的整数，取平均再乘以 0.8，最接近的人分数不动，其余的人下沉。到 −10，名字被文书和王水溶掉。

## 游玩

[https://08102317cdw-art.github.io/beauty-death-overtime/](https://08102317cdw-art.github.io/beauty-death-overtime/)

这是 `main` 的 GitHub Pages。地址带项目子路径 `/beauty-death-overtime/`，构建时的 Vite `base` 与它一致。第一次发布需要在仓库里把 **Settings → Pages → Build and deployment → Source** 设为 **GitHub Actions**。

## 本地

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/beauty-death-overtime/`。

```bash
npm run build
npm run preview
```

预览在 `http://localhost:4173/beauty-death-overtime/`。`?seed=VX-TEST` 会固定案号，对手的落子可以复现。`M` 静音。

## 怎么打

1. 入座，确认平板，听完规则文书。
2. 第一轮有五分钟。之后每轮一分钟。新条款加入时再给五分钟。
3. 选一个整数并落子。超时则本轮数字作废，扣 1 分。
4. 看平均、×0.8 的目标和四舍五入。最接近者不扣分，其余 −1。并列最接近者都不扣分。
5. 一人除名后：相同的数字无效，选的人仍扣分。
6. 两人除名后：精确命中四舍五入后的目标，其余人 −2。超时仍只扣 1 分。
7. 只剩两人：有人选 0，则选 100 的人直接胜这一轮。
8. 只剩你，是 GAME CLEAR。你到 −10，是 GAME OVER。方块王也会被除名。

美术和条款的边界写在 [docs/DESIGN.md](docs/DESIGN.md)。

## 许可

代码为 [MIT](LICENSE)。字体子集在 `src/assets/fonts`，许可证见 [public/fonts/OFL.txt](public/fonts/OFL.txt)。
