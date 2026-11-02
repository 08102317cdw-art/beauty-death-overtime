# Design notes

House style for 选美：死亡加时赛. If a later change cannot be described with this document, it does not belong in the game yet.

## Pillars

1. **Rules are the blade.** Every round is a card the player can read before the clock starts. The card has a voice and an 执行 line. The 执行 line is mechanically exact. Overtime replaces the card and declares that only first place lives.
2. **Beauty is a lever.** Popularity, acting, and dirt are visible numbers. They are not morals. Dirt is both a weapon and a weight, depending on the card.
3. **Hands are temporary.** An alliance is a directed offer. Mutual only if both offer. A hand extended in round one is still on the table in overtime, and some personalities take it back with a knife.
4. **The audience is a crowd.** Speech, bribes, rumors, and silence are different ways of feeding it. Rumors against a clean face or a 温水 contestant rebound.
5. **Death is paperwork.** Epitaphs sound like committee notes. No gore imagery, no screaming UI. The joke is administrative.
6. **The visa number is fate.** Seed determines the cast, stat jitter, which rule variant the suit draws, and the overtime card. It does not determine the player's three beats.

## The slice

Title → visa suit → green room (read the card, see the cast) → round one, three beats on a clock → public ledger and one elimination → overtime briefing → three beats, harsher card → one survivor.

Four contestants enter. Round one removes the lowest score. Overtime keeps rank one and retires the rest. Timeout ranks below everyone who finished, in both rounds.

Suits:

| Suit | Temperament | Round-one cards |
| --- | --- | --- |
| 黑桃 | The body. Empty frames are punished. | 镜头饥饿, 热灯 |
| 红心 | The face and the wound. | 微笑税, 黑料兑换 |
| 方块 | Reading. One instruction is a lie. | 公示的谎, 沉默金奖 |
| 梅花 | Hands. Yours, specifically. | 拉手协议, 血盟预告 |

血盟预告 always draws 血盟兑现 as the overtime card, so the promise on the first card is paid. Other visas draw one of 黑料摊牌, 观众是群狗, 墓志铭时钟.

The cast is three rivals with three different personalities, drawn from six authored contestants: 白瓷 (流量), 冷银 and 霜桐 (实力), 绛纱 and 墨莲 (心机), 蜜蜡 (温水). Personalities are habits, not optimal solvers. 流量 buys the room. 实力 will not sell the face. 心机 opens scars and aims rumor at the strongest 气场. 温水 offers a hand, and in overtime she takes it back, preferring the player if she is holding theirs.

## What the player is allowed to know

Before the clock: stats, bios, the full card, and any hand already on the table.

During the clock: tags on choices that the card itself calls out (空镜, 公示建议, 热灯). The gold tag on 公示的谎 is the lie. It is marked because the card says the gold advice is false.

After the round: the ledger. 底 / 走 / 观 / 人 / 规 / 罚 / 运. The columns add up to the total. Ties break toward heavier dirt, then a seeded order. Say this on the card footer. Do not hide it.

Do not add a tutorial layer that talks over the committee. If a beat is unfair, fix the card or the math.

## Numbers

The source of truth is `src/game/systems/scoring.ts`. In prose:

- Round one weights follow the suit. Spades lean on acting, hearts on popularity, diamonds slightly on acting, clubs are flat.
- Overtime flattens the weights so a specialist does not automatically keep the crown. The overtime card is what should swing the room.
- 卖相 and 才艺 are flat bonuses, with a small extra if that stat is already extreme. This stops a high stat from snowballing through the choice as well as the base.
- 翻黑料 is weak unless the card wants a confession, or the dirt is very deep.
- 买票 is stronger than 演讲 and leaves dirt behind. That dirt matters if overtime is 黑料摊牌.
- A rumor into a clean or 温水 face rebounds. 心机 does it anyway when that face is the biggest threat.
- 拉手协议 discounts anyone who did not extend their own hand. Being held by someone else is not compliance.
- 蜜蜡, when the suit is clubs, offers her hand to the player. Refusing does not remove it. Overtime is where that hand is answered.

`npm run balance` checks that a reader has a winning line on the sample seeds, that ignoring the card usually dies in round one, and that a timeout never survives round one.

## Art bible

### Color

Use the tokens in `src/style.css`. Do not invent a second palette.

| Token | Hex | Use |
| --- | --- | --- |
| void / stage | `#070605` / `#0c0908` | The room. Not pure #000. |
| spot | `#f3ecdf` | Primary type on black. Cold white, not cream-yellow. |
| gold | `#d9d0bc` | Hairlines, Latin eyebrows, the seal. Not a button fill. |
| gold-dim | `#b3a894` | Secondary type. Must stay readable. |
| blood | `#9a2433` | One rule, one stamp, the binding thread. |
| blood-hot | `#c73e4a` | The stamp's ink, late timer, hover. |
| rose | `#c48b8f` | Epitaphs and small warnings. |
| paper | `#efe6d4` | Visa slip and rule card only. |
| ink | `#1c1412` | Type on paper. |

Hearts and diamonds are blood. Spades and clubs are gold, or ink when drawn on paper. Suit marks are drawn, not emoji.

### Type

- Chinese: Noto Serif SC, weights 400 and 600, subset in `public/fonts`. Do not fall back to a gothic or a handwriting face.
- Latin and numerals: Cinzel. Eyebrows, visa numbers, the ledger total, the timer. Letterspaced. Never used for Chinese.
- Titles are large, with tight leading. A single blood rule may separate 选美 from 死亡加时赛. Do not add a second accent line on the same screen.
- No Comic Sans, no rounded display faces, no all-caps Chinese.

### Portraits

House style, implemented in `src/game/ui/portrait.ts`:

- Same viewBox, same face ellipse, same slit eyes with no pupils, same neck and black costume.
- A face is a few flat shapes. No eyelashes, no blush circles, no anime highlights, no photographic texture.
- Variation is hair silhouette (bob, long, updo, veil, crop, wave), lip color, one mark (mole, earring, tear line, scar), and whether the mouth is flat or slightly open.
- One contestant may cover an eye with hair. That is the only asymmetry of the features.
- Death is grayscale plus one blood crack. Do not replace the portrait with a skull or a red X.
- New contestants must be drawable with the existing function. If a design needs a new mark, add one mark, not a new illustration style.

### Objects

- The visa slip and the rule card are the only ivory rectangles. Sharp corners. A blood binding edge on the slip. No drop-shadow language from a UI kit; one deep shadow is enough to say "paper in a dark room."
- Choice rows are typographic, separated by hairlines, not cards. Index with Cinzel roman numerals.
- The timer is a thin ring and a number. Under ten seconds it turns blood. It does not bounce.
- The elimination stamp is rotated, letterspaced, and used once per ledger. Gold ink only for 加冕.
- Endings are a narrow column of type. Win draws a crown as a stroke. Death is a notice, not a splash screen.

### Motion

Slow, mechanical, few.

- Spotlight drifts. Seal ring turns once every forty seconds.
- The rule card deals in. The stamp lands. The crown stroke draws.
- Scene changes fade up a few pixels. No page slides, no confetti, no shake except the late timer's opacity.
- `prefers-reduced-motion` kills the drift, the spin, the deal, and the stamp. The information stays.

### Sound

`src/game/audio.ts` is the whole mix: a low sine drone under a gentle filter, a tick, a paper sting, a dull stamp, a minor-second death, a fifth for the crown, and a slow thump under ten seconds. Nothing is streamed. Mute is remembered. If new audio is added, it has to sit under the voice of the type. A recorded room tone may replace the drone later. Do not add licensed songs.

### Do not

- Emoji, stock photos, generated faces that do not match the house style, clipart roses, purple gradients, glassmorphism, rounded "app" cards, bootstrap grids of equal white panels.
- Hidden math. If the player must know it to survive, it is on the card.
- Gore, slurs, or sexualization of the swimsuit round. The round is about being looked at by a committee. The writing stays on the paperwork.
- A second typeface "for fun."
- Tutorial popovers. The green room is the tutorial.

## Milestones

1. **Third round.** One more card, written so it can quote a specific earlier choice (the hand, the rumor, the overexposure) without a new system.
2. **Memory.** A rival you betrayed can return on a later visa with the scar mark already in the house style, and one line of copy that names the old visa number.
3. **Audience meter.** A single crowd mood visible in the green room, fed by the same four actions. Not a second scoreboard.
4. **Portrait poses.** Talent, death, crown, drawn with the same ellipse and slits.
5. **Sound.** Replace the drone with a recorded room. Keep the stings short.
6. **Desktop shell.** Electron or a sibling, after the slice is worth installing. The game stays a Vite app underneath.
