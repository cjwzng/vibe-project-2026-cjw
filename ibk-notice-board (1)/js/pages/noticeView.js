/**
 * 화면 2) 공지사항 상세
 * - 진입 시 조회수 +1 (수정/등록 직후 복귀 시에는 noinc=1 로 중복 증가 방지)
 * - 이전글/다음글은 목록과 같은 정렬 기준(중요공지 우선 → 최신순)으로 계산
 */
import { noticeService } from "../services/noticeService.js";
import { attachmentService } from "../services/attachmentService.js";
import { categoryLabel } from "../config.js";
import { mountShell, renderMessageCard } from "../components/pageShell.js";
import { confirmDialog, alertDialog } from "../components/dialog.js";
import { icons } from "../components/icons.js";
import { buildHash, pickListParams, navigate } from "../utils/router.js";
import { escapeHtml, formatBytes, formatDate, formatNumber } from "../utils/format.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";
import { sortNotices } from "../utils/noticeQuery.js";

function neighborRow(label, icon, target, listParams) {
  if (!target) {
    return `<li class="neighbor"><span class="neighbor__label">${icon}${label}</span><span class="neighbor__empty">${label}이 없습니다.</span></li>`;
  }
  return `
    <li class="neighbor">
      <span class="neighbor__label">${icon}${label}</span>
      <a class="neighbor__title" href="${buildHash(`/view/${target.id}`, listParams)}">${escapeHtml(target.title)}</a>
      <time class="neighbor__date" datetime="${target.createdAt}">${formatDate(target.createdAt)}</time>
    </li>`;
}

function attachmentsHtml(attachments) {
  if (!attachments?.length) return "";
  return `
    <section class="detail-attachments" aria-label="첨부파일">
      <h2 class="detail-attachments__title">${icons.clip(16)}첨부파일 <span>${attachments.length}</span></h2>
      <ul>
        ${attachments
          .map(
            (file) => `
          <li>
            <button type="button" class="attach-link" data-attachment="${file.id}">
              <span class="attach-link__name">${escapeHtml(file.name)}</span>
              <span class="attach-link__size">(${formatBytes(file.size)})</span>
              ${icons.download(14)}
            </button>
          </li>`,
          )
          .join("")}
      </ul>
    </section>`;
}

async function downloadAttachment(meta) {
  try {
    const url = await attachmentService.getDownloadUrl(meta);
    if (!url) {
      await alertDialog(
        "개발(Mock) 모드에서는 용량 제한으로 원본 파일을 저장하지 않았습니다. Firebase Storage 연동 후 다운로드할 수 있습니다.",
        "다운로드 불가",
      );
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = meta.name;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error(error);
    await alertDialog("파일을 다운로드하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

export async function renderNoticeView(root, ctx) {
  const listParams = pickListParams(ctx.params);
  const skipIncrease = ctx.params.get("noinc") === "1";
  const slot = mountShell(root);
  const listHref = buildHash("/", listParams);

  slot.innerHTML = `<div class="board-card" aria-busy="true"><div class="skeleton skeleton--title"></div><div class="skeleton skeleton--block"></div></div>`;

  let notice;
  let all;
  try {
    [notice, all] = await Promise.all([
      skipIncrease ? noticeService.getById(ctx.id) : noticeService.increaseViewCount(ctx.id),
      noticeService.getAll(),
    ]);
  } catch (error) {
    console.error("Failed to load notice", error);
    if (!ctx.isCurrent()) return;
    renderMessageCard(slot, {
      title: "게시물을 불러오지 못했습니다.",
      message: "잠시 후 다시 시도해주세요.",
      actionHref: listHref,
      actionLabel: "목록으로",
    });
    return;
  }
  if (!ctx.isCurrent()) return;

  if (!notice) {
    renderMessageCard(slot, {
      title: "존재하지 않거나 삭제된 게시물입니다.",
      message: "목록에서 다른 게시물을 선택해주세요.",
      actionHref: listHref,
      actionLabel: "목록으로",
    });
    return;
  }

  const sorted = sortNotices(all);
  const index = sorted.findIndex((item) => item.id === notice.id);
  const prev = index > 0 ? sorted[index - 1] : null; // 목록에서 바로 위(더 최근) 글
  const next = index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null; // 바로 아래(이전) 글
  const edited = notice.updatedAt !== notice.createdAt;

  slot.innerHTML = `
    <article class="board-card notice-detail">
      <header class="detail-head">
        <div class="detail-head__main">
          <div class="detail-badges">
            ${notice.isImportant ? `<span class="badge badge--notice">${icons.pin(11)}공지</span>` : ""}
            <span class="badge badge--type">${escapeHtml(categoryLabel(notice.category))}</span>
          </div>
          <h2 class="detail-title">${escapeHtml(notice.title)}</h2>
        </div>
        <div class="detail-meta">
          <span class="meta-item" title="등록일">${icons.calendar(16)}<time datetime="${notice.createdAt}">${formatDate(notice.createdAt)}</time></span>
          ${edited ? `<span class="meta-item meta-item--muted" title="수정일">수정 <time datetime="${notice.updatedAt}">${formatDate(notice.updatedAt)}</time></span>` : ""}
          <span class="meta-item" title="조회수">${icons.eye(16)}${formatNumber(notice.viewCount)}</span>
        </div>
      </header>

      <div class="detail-body rich-content">${sanitizeHtml(notice.content)}</div>

      ${attachmentsHtml(notice.attachments)}

      <ul class="detail-neighbors" aria-label="이전글 다음글">
        ${neighborRow("이전글", icons.chevronUp(14), prev, listParams)}
        ${neighborRow("다음글", icons.chevronDown(14), next, listParams)}
      </ul>

      <footer class="detail-actions">
        <a class="btn" href="${listHref}">목록으로</a>
        <div class="detail-actions__group">
          <a class="btn" href="${buildHash(`/edit/${notice.id}`, listParams)}">${icons.pencil(16)}수정</a>
          <button type="button" class="btn" data-action="delete">${icons.trash(16)}삭제</button>
        </div>
      </footer>
    </article>`;

  slot.querySelectorAll("[data-attachment]").forEach((button) => {
    button.addEventListener("click", () => {
      const meta = notice.attachments.find((file) => file.id === button.dataset.attachment);
      if (meta) downloadAttachment(meta);
    });
  });

  slot.querySelector('[data-action="delete"]').addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "게시물 삭제",
      message: "이 공지사항을 삭제하시겠습니까?\n삭제한 게시물은 복구할 수 없습니다.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;

    try {
      await noticeService.delete(notice.id);
      // 첨부파일 본문도 정리 (실패해도 게시물 삭제는 유지)
      await Promise.allSettled((notice.attachments ?? []).map((meta) => attachmentService.remove(meta)));
      navigate(listHref);
    } catch (error) {
      console.error(error);
      await alertDialog("삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  });
}
