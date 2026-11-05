/**
 * 화면 1) 공지사항 목록
 * 데이터는 noticeService 로만 접근한다. (localStorage 직접 접근 금지)
 */
import { noticeService } from "../services/noticeService.js";
import { BOARD, NOTICE_CATEGORIES } from "../config.js";
import { mountShell, renderMessageCard } from "../components/pageShell.js";
import { renderPagination } from "../components/pagination.js";
import { icons } from "../components/icons.js";
import { buildHash } from "../utils/router.js";
import { escapeHtml, formatDate, formatNumber, isRecent } from "../utils/format.js";
import { sortNotices, filterNotices, paginate } from "../utils/noticeQuery.js";

const SKELETON_ROWS = 7;

const skeletonRows = () =>
  Array.from({ length: SKELETON_ROWS }, () => `
    <tr class="board-row board-row--skeleton" aria-hidden="true">
      <td class="col-no"><span class="skeleton"></span></td>
      <td class="col-title"><span class="skeleton skeleton--wide"></span></td>
      <td class="col-date"><span class="skeleton"></span></td>
      <td class="col-views"><span class="skeleton"></span></td>
    </tr>`).join("");

function rowHtml(notice, listParams) {
  const href = buildHash(`/view/${notice.id}`, listParams);
  return `
    <tr class="board-row${notice.isImportant ? " is-pinned" : ""}">
      <td class="col-no" data-label="번호">${formatNumber(notice.postNo)}</td>
      <td class="col-title">
        <a class="board-link" href="${href}">
          ${notice.isImportant ? `<span class="badge badge--notice">${icons.pin(11)}공지</span>` : ""}
          <span class="board-title-text">${escapeHtml(notice.title)}</span>
          ${isRecent(notice.createdAt, BOARD.newBadgeDays) ? '<span class="badge badge--new">NEW</span>' : ""}
          ${notice.attachments?.length ? `<span class="board-clip" title="첨부파일 ${notice.attachments.length}개">${icons.clip(14)}<span class="visually-hidden">첨부파일 있음</span></span>` : ""}
        </a>
      </td>
      <td class="col-date" data-label="등록일"><time datetime="${notice.createdAt}">${formatDate(notice.createdAt)}</time></td>
      <td class="col-views" data-label="조회수">${formatNumber(notice.viewCount)}</td>
    </tr>`;
}

export async function renderNoticeList(root, ctx) {
  const category = ctx.params.get("category") || "all";
  const q = ctx.params.get("q") || "";
  const requestedPage = Number(ctx.params.get("page")) || 1;

  const slot = mountShell(root);
  slot.innerHTML = `
    <div class="board-card" aria-busy="true">
      <div class="board-toolbar"><p class="board-count"><span class="skeleton skeleton--wide"></span></p></div>
      <table class="board-table"><tbody>${skeletonRows()}</tbody></table>
    </div>`;

  let all;
  try {
    all = await noticeService.getAll();
  } catch (error) {
    console.error("Failed to load notices", error);
    if (!ctx.isCurrent()) return;
    renderMessageCard(slot, {
      title: "목록을 불러오지 못했습니다.",
      message: "잠시 후 다시 시도해주세요.",
      actionHref: location.hash || "#/",
      actionLabel: "다시 시도",
    });
    return;
  }
  if (!ctx.isCurrent()) return;

  const filtered = sortNotices(filterNotices(all, { category, q }));
  const { items, total, totalPages, page } = paginate(filtered, requestedPage, BOARD.pageSize);
  const listParams = { page: page > 1 ? page : undefined, category: category !== "all" ? category : undefined, q };
  const hrefForPage = (n) => buildHash("/", { ...listParams, page: n > 1 ? n : undefined });

  const rows = items.length
    ? items.map((notice) => rowHtml(notice, listParams)).join("")
    : `<tr><td class="board-empty" colspan="4">${q || category !== "all" ? "검색 결과가 없습니다." : "등록된 게시물이 없습니다."}</td></tr>`;

  slot.innerHTML = `
    <div class="board-card">
      <div class="board-toolbar">
        <p class="board-count">총 <strong>${formatNumber(total)}</strong>건의 게시물이 있습니다.</p>
        <a class="btn btn--primary" href="${buildHash("/write", listParams)}">${icons.pencil(16)}글쓰기</a>
      </div>

      <div class="board-table-wrap">
        <table class="board-table">
          <caption class="visually-hidden">공지사항 목록 (번호, 제목, 등록일, 조회수)</caption>
          <thead>
            <tr>
              <th scope="col" class="col-no">번호</th>
              <th scope="col" class="col-title">제목</th>
              <th scope="col" class="col-date">등록일</th>
              <th scope="col" class="col-views">조회수</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      ${renderPagination({ page, totalPages, blockSize: BOARD.pageBlockSize, hrefFor: hrefForPage })}

      <form class="board-search" role="search" aria-label="공지사항 검색">
        <label class="visually-hidden" for="search-category">분류</label>
        <select id="search-category" name="category" class="field-select">
          <option value="all">전체</option>
          ${NOTICE_CATEGORIES.map((c) => `<option value="${c.value}"${c.value === category ? " selected" : ""}>${c.label}</option>`).join("")}
        </select>
        <label class="visually-hidden" for="search-q">검색어</label>
        <input id="search-q" name="q" type="search" class="field-input" placeholder="제목을 입력해주세요." value="${escapeHtml(q)}" autocomplete="off">
        <button type="submit" class="btn btn--primary">${icons.search(16)}검색</button>
      </form>
    </div>`;

  slot.querySelector(".board-search").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    location.hash = buildHash("/", { category: form.get("category") !== "all" ? form.get("category") : undefined, q: String(form.get("q")).trim() });
  });
}
