import { getPageWindow } from "../utils/noticeQuery.js";

/**
 * 페이지네이션 HTML 문자열 반환.
 * « 첫 페이지 · ‹ 이전 · 1 2 3 … · › 다음 · » 마지막 페이지
 * @param {{page:number,totalPages:number,blockSize:number,hrefFor:(page:number)=>string}} options
 */
export function renderPagination({ page, totalPages, blockSize, hrefFor }) {
  const { start, end } = getPageWindow(page, totalPages, blockSize);

  const control = (label, text, target, disabled) =>
    disabled
      ? `<span class="pagination__item pagination__item--control is-disabled" aria-disabled="true" aria-label="${label}">${text}</span>`
      : `<a class="pagination__item pagination__item--control" href="${hrefFor(target)}" aria-label="${label}">${text}</a>`;

  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    .map((n) =>
      n === page
        ? `<span class="pagination__item is-current" aria-current="page">${n}</span>`
        : `<a class="pagination__item" href="${hrefFor(n)}" aria-label="${n}페이지">${n}</a>`,
    )
    .join("");

  return `
    <nav class="pagination" aria-label="페이지 이동">
      ${control("첫 페이지", "«", 1, page === 1)}
      ${control("이전 페이지", "‹", page - 1, page === 1)}
      ${numbers}
      ${control("다음 페이지", "›", page + 1, page === totalPages)}
      ${control("마지막 페이지", "»", totalPages, page === totalPages)}
    </nav>`;
}
