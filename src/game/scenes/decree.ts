import { BASE_ARTICLES, TIMEOUT_LINE } from "../content/copy";

export function renderDecree(): string {
  const articles = BASE_ARTICLES.map(
    (article) => `<article>
      <p class="doc-kicker">${article.kicker}</p>
      <h3>${article.title}</h3>
      <p>${article.text}</p>
    </article>`,
  ).join("");
  return `<section class="ceremony">
    <header class="scene-head">
      <p class="eyebrow"><span class="latin">The articles</span> · 规则文书</p>
      <h2>宣读</h2>
      <p class="lede">听完再落子。第一轮给你五分钟消化。之后每轮一分钟。新条款加入时，再给五分钟。</p>
    </header>
    <div class="document">
      <p class="doc-seal">美人投票</p>
      ${articles}
      <p class="doc-timeout">${TIMEOUT_LINE}</p>
    </div>
    <div class="ceremony-actions"><button type="button" class="btn" data-act="begin">开始第一轮 · 五分钟</button></div>
  </section>`;
}
