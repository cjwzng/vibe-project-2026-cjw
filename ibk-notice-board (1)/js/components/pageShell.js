import { icons } from "./icons.js";
import { escapeHtml } from "../utils/format.js";

/**
 * 모든 화면 공통 영역: 브레드크럼 + NOTICE 타이틀 + 설명.
 * @returns {HTMLElement} 각 화면이 카드(.board-card)를 그려 넣을 슬롯
 */
export function mountShell(root) {
  root.innerHTML = `
    <section class="outer-box notice-page">
      <div class="inner-box inner-box--narrow">
        <nav class="breadcrumb" aria-label="현재 위치">
          <a class="breadcrumb__home" href="index.html" aria-label="홈">${icons.home(18)}</a>
          <span class="breadcrumb__sep" aria-hidden="true">›</span>
          <a href="#/">홍보센터</a>
          <span class="breadcrumb__sep" aria-hidden="true">›</span>
          <a href="#/" aria-current="page">공지사항</a>
        </nav>
        <div class="notice-hero">
          <h1>NOTICE</h1>
          <p>IBK기업은행의 최신 소식과 공지사항을 안내해 드립니다.</p>
        </div>
        <div class="notice-slot" id="notice-slot"></div>
      </div>
    </section>`;
  return root.querySelector("#notice-slot");
}

export const renderMessageCard = (slot, { title, message, actionHref, actionLabel }) => {
  slot.innerHTML = `
    <div class="board-card board-card--message">
      <p class="board-message__title">${escapeHtml(title)}</p>
      <p class="board-message__text">${escapeHtml(message)}</p>
      ${actionHref ? `<a class="btn" href="${actionHref}">${escapeHtml(actionLabel)}</a>` : ""}
    </div>`;
};
