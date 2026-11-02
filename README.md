# 选美：死亡加时赛

Beauty: Death Overtime. A short, seedable beauty-pageant strategy game. The committee prints the rules. The lights enforce them. Elimination is not a ranking. It is a departure.

This is a vertical slice: title, visa, one contest round, one overtime, and a win or a death notice. Same visa number, same rivals, same rules. Different hands, different obituaries.

## Play

[https://08102317cdw-art.github.io/beauty-death-overtime/](https://08102317cdw-art.github.io/beauty-death-overtime/)

That address is the GitHub Pages build of `main`. The site is served from the `/beauty-death-overtime/` subpath, and the Vite `base` matches it so scripts, fonts, and the icon load there. The first time, set the repository to **Settings → Pages → Build and deployment → Source: GitHub Actions**. The workflow cannot switch that setting itself.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/beauty-death-overtime/`. Dev uses the same subpath as Pages. Production build:

```bash
npm run build
npm run preview
```

Preview is `http://localhost:4173/beauty-death-overtime/`.

No runtime dependencies. TypeScript and Vite only. A balance check lives at `npm run balance` and simulates scripted play across seeds.

Append `?seed=VX-TEST` to replay a known visa number.

## How to play

1. **领取签证.** Name yourself. Keep or replace the visa number. The number is the seed.
2. **Choose a suit.** Spades, hearts, diamonds, clubs. The suit chooses the temperament of round one, not your talent.
3. **Read the card.** Every rule has a literary text and an 执行 line. The 执行 line is true. The cruelty is the rule itself.
4. **Three beats, one clock.** 走位, then 观众, then 人心. Keys `1`–`4` pick the printed options. On the last beat, `A` / `B` switch 结盟 and 背刺, `1`–`3` choose a person, `0` is 旁观. `M` mutes the room tone.
5. **One person leaves.** The lowest score dies. Ties break toward the heavier scandal.
6. **Overtime keeps a single face.** Read the new card. Old hands are still on the table. Only first place receives a survival visa.

Timeout does not mean a small penalty. An unfinished three-beat ranks at the bottom.

## Design pillars

- **Rules are the blade.** A round is a published rule with a timer. Overtime rewrites it and keeps only one visa.
- **Beauty is a lever.** Popularity, acting, and dirt are public. Alliances are temporary. None of them is virtue.
- **The audience is a crowd.** You can feed it, bore it, or sic it on someone. Clean targets bite back.
- **Black humor, not gore.** Death is announced like a pageant critique. The joke is the paperwork.
- **Fate is seedable.** Rivals, jitter, and which rule variant you draw come from the visa number. Your three beats do not.

Full art direction, system notes, and the do-not list are in [docs/DESIGN.md](docs/DESIGN.md). Follow-up work should stay inside that bible.

## Art direction, in short

Cinematic dark pageant. Black stage, one cold spotlight, blood used rarely, gold used as a hairline. Chinese text is set in a subset of Noto Serif SC. Latin eyebrows and numbers are Cinzel. Portraits are a house style: the same face, no pupils, variation only in hair, mouth, and one mark. Paper objects (the visa slip, the rule card) are the only ivory in the room. Sound is a small synthesized drone and a few stings, with a mute control. Silence is a supported state.

## Project map

```text
src/game/content     copy, rivals, rules, epitaphs
src/game/systems     seeded run, rival decisions, scoring
src/game/scenes      title, visa, briefing, round, ledger, ending
src/game/ui          portraits, seals, dust, type
src/style.css        the stage
```

Scoring constants live in `src/game/systems/scoring.ts`. If a rule's 执行 line and that file disagree, the file is the bug.

## Next milestones

- A third round, still one visa, with a rule that quotes what you did in the first two.
- Rivals who remember a betrayal on a later visa.
- The audience as a visible faction, not only a column in the ledger.
- More poses in the same portrait house style: talent, death, crown.
- A recorded room tone in place of the synthesized bed.
- An Electron shell, once the slice is worth installing.

## License

Game code is [MIT](LICENSE). The subset fonts in `src/assets/fonts` are SIL Open Font License 1.1; see [public/fonts/OFL.txt](public/fonts/OFL.txt).
