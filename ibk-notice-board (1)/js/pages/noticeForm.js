/**
 * 화면 3) 글쓰기 / 화면 4) 글수정  (같은 폼을 mode 로 구분)
 * - 저장소 접근은 noticeService / attachmentService 만 사용한다.
 * - 첨부파일은 "선택" 시점에는 메모리(File)에만 두고, 등록/수정 완료 시점에 업로드한다. (취소 시 찌꺼기 방지)
 */
import { noticeService } from "../services/noticeService.js";
import { attachmentService } from "../services/attachmentService.js";
import { BOARD, CURRENT_USER, NOTICE_CATEGORIES } from "../config.js";
import { mountShell, renderMessageCard } from "../components/pageShell.js";
import { createRichTextEditor } from "../components/richTextEditor.js";
import { confirmDialog } from "../components/dialog.js";
import { icons } from "../components/icons.js";
import { buildHash, navigate, pickListParams } from "../utils/router.js";
import { escapeHtml, formatBytes, formatNumber } from "../utils/format.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";

const extOf = (name) => name.split(".").pop().toLowerCase();

function formHtml({ isEdit, notice, listHref }) {
  const category = notice?.category ?? "general";
  return `
    <form class="board-card notice-form" novalidate>
      <h2 class="form-heading"><span aria-hidden="true"></span>${isEdit ? "글 수정" : "글쓰기"}</h2>
      <p class="field-error field-error--form" data-form-error role="alert" hidden></p>

      <div class="form-table">
        <div class="form-row">
          <label class="form-label" for="notice-title">제목 <span class="required" aria-hidden="true">*</span></label>
          <div class="form-field">
            <input id="notice-title" name="title" class="field-input" type="text" maxlength="${BOARD.titleMax}"
              placeholder="제목을 입력해주세요." value="${escapeHtml(notice?.title ?? "")}" aria-required="true" aria-describedby="title-error" autocomplete="off">
            <p class="field-error" id="title-error" data-error-for="title" role="alert" hidden></p>
          </div>
        </div>

        <div class="form-row">
          <span class="form-label" id="type-label">공지유형</span>
          <div class="form-field form-field--inline">
            <div class="radio-group" role="radiogroup" aria-labelledby="type-label">
              ${NOTICE_CATEGORIES.map(
                (c) => `
                <label class="choice"><input type="radio" name="category" value="${c.value}"${c.value === category ? " checked" : ""}><span>${c.label}</span></label>`,
              ).join("")}
            </div>
            <label class="choice choice--important">
              <input type="checkbox" name="isImportant"${notice?.isImportant ? " checked" : ""}>
              <span>${icons.pin(12)}중요공지 (목록 상단 고정)</span>
            </label>
          </div>
        </div>

        <div class="form-row form-row--editor">
          <span class="form-label" id="content-label">내용 <span class="required" aria-hidden="true">*</span></span>
          <div class="form-field">
            <div data-editor></div>
            <p class="field-error" data-error-for="content" role="alert" hidden></p>
          </div>
        </div>

        <div class="form-row">
          <span class="form-label" id="file-label">첨부파일</span>
          <div class="form-field">
            <div class="file-picker">
              <button type="button" class="btn btn--sm" data-file-button>파일 선택</button>
              <span class="file-picker__status" data-file-status>선택된 파일이 없습니다.</span>
              <span class="file-picker__hint">(최대 10MB, JPG, PNG, PDF, ZIP · 최대 ${BOARD.attachments.maxCount}개)</span>
              <input type="file" class="visually-hidden" data-file-input multiple accept="${BOARD.attachments.accept}" tabindex="-1" aria-labelledby="file-label">
            </div>
            <ul class="file-list" data-file-list></ul>
            <p class="field-error" data-error-for="files" role="alert" hidden></p>
          </div>
        </div>

        ${
          isEdit
            ? `
        <div class="form-row">
          <span class="form-label">수정일</span>
          <div class="form-field">
            <label class="choice"><input type="checkbox" name="touchUpdatedAt" checked><span>수정일을 현재 날짜로 갱신</span></label>
          </div>
        </div>`
            : ""
        }
      </div>

      <div class="form-actions">
        ${isEdit ? `<a class="btn" href="${listHref}" data-guard>목록으로</a>` : "<span></span>"}
        <div class="form-actions__group">
          <button type="button" class="btn" data-action="cancel">취소</button>
          <button type="submit" class="btn btn--primary" data-submit>${isEdit ? "수정완료" : "등록"}</button>
        </div>
      </div>
    </form>`;
}

export async function renderNoticeForm(root, ctx) {
  const isEdit = ctx.mode === "edit";
  const listParams = pickListParams(ctx.params);
  const listHref = buildHash("/", listParams);
  const slot = mountShell(root);

  let notice = null;
  if (isEdit) {
    slot.innerHTML = `<div class="board-card" aria-busy="true"><div class="skeleton skeleton--title"></div><div class="skeleton skeleton--block"></div></div>`;
    try {
      notice = await noticeService.getById(ctx.id);
    } catch (error) {
      console.error(error);
    }
    if (!ctx.isCurrent()) return undefined;
    if (!notice) {
      renderMessageCard(slot, {
        title: "존재하지 않거나 삭제된 게시물입니다.",
        message: "목록에서 다른 게시물을 선택해주세요.",
        actionHref: listHref,
        actionLabel: "목록으로",
      });
      return undefined;
    }
  }

  const backHref = isEdit ? buildHash(`/view/${notice.id}`, { ...listParams, noinc: 1 }) : listHref;
  slot.innerHTML = formHtml({ isEdit, notice, listHref });

  const form = slot.querySelector("form");
  const titleInput = form.elements.title;
  const submitButton = form.querySelector("[data-submit]");
  const formError = form.querySelector("[data-form-error]");

  /* ---------- 에디터 ---------- */
  let dirty = false;
  const markDirty = () => {
    dirty = true;
  };
  const editor = createRichTextEditor(form.querySelector("[data-editor]"), {
    placeholder: "내용을 입력해주세요.",
    maxLength: BOARD.contentMax,
    initialHtml: notice?.content ?? "",
    labelledBy: "content-label",
    uploadImage: (file) => attachmentService.uploadInlineImage(file),
    onChange: markDirty,
  });
  form.addEventListener("input", markDirty);
  form.addEventListener("change", markDirty);

  /* ---------- 첨부파일 상태 ---------- */
  let existing = [...(notice?.attachments ?? [])]; // 이미 저장된 메타데이터
  const removedExisting = []; // 수정 중 삭제 표시한 기존 파일
  let pendingFiles = []; // 아직 업로드 전인 File 객체

  const fileList = form.querySelector("[data-file-list]");
  const fileStatus = form.querySelector("[data-file-status]");
  const fileInput = form.querySelector("[data-file-input]");

  const showError = (name, message) => {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    el.textContent = message ?? "";
    el.hidden = !message;
    form.elements[name]?.toggleAttribute?.("aria-invalid", Boolean(message));
  };

  function renderFiles() {
    const items = [
      ...existing.map((meta, i) => ({ kind: "existing", index: i, name: meta.name, size: meta.size })),
      ...pendingFiles.map((file, i) => ({ kind: "pending", index: i, name: file.name, size: file.size })),
    ];
    fileList.innerHTML = items
      .map(
        (item) => `
        <li class="file-list__item">
          ${icons.clip(14)}
          <span class="file-list__name">${escapeHtml(item.name)}</span>
          <span class="file-list__size">${formatBytes(item.size)}</span>
          <button type="button" class="file-list__remove" data-remove="${item.kind}:${item.index}" aria-label="${escapeHtml(item.name)} 삭제">${icons.close(14)}</button>
        </li>`,
      )
      .join("");
    fileStatus.textContent = items.length ? `${items.length}개 선택됨` : "선택된 파일이 없습니다.";
  }

  function addFiles(files) {
    const errors = [];
    files.forEach((file) => {
      if (existing.length + pendingFiles.length >= BOARD.attachments.maxCount) {
        errors.push(`첨부파일은 최대 ${BOARD.attachments.maxCount}개까지 등록할 수 있습니다.`);
        return;
      }
      if (!BOARD.attachments.allowedExt.includes(extOf(file.name))) {
        errors.push(`${file.name}: JPG, PNG, PDF, ZIP 파일만 첨부할 수 있습니다.`);
        return;
      }
      if (file.size > BOARD.attachments.maxBytes) {
        errors.push(`${file.name}: 파일 크기는 최대 10MB까지 가능합니다. (${formatBytes(file.size)})`);
        return;
      }
      pendingFiles.push(file);
    });
    showError("files", [...new Set(errors)].join("\n"));
    renderFiles();
  }

  form.querySelector("[data-file-button]").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    addFiles([...fileInput.files]);
    fileInput.value = ""; // 같은 파일을 다시 선택할 수 있게
  });
  fileList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const [kind, index] = button.dataset.remove.split(":");
    if (kind === "existing") removedExisting.push(...existing.splice(Number(index), 1));
    else pendingFiles.splice(Number(index), 1);
    showError("files", "");
    markDirty();
    renderFiles();
  });
  renderFiles();

  /* ---------- 취소 / 이탈 ---------- */
  async function leave(href) {
    if (dirty) {
      const ok = await confirmDialog({
        title: "작성 취소",
        message: "작성 중인 내용이 저장되지 않습니다.\n페이지를 나가시겠습니까?",
        confirmText: "나가기",
        cancelText: "계속 작성",
      });
      if (!ok) return;
    }
    dirty = false;
    navigate(href);
  }
  form.querySelector('[data-action="cancel"]').addEventListener("click", () => leave(backHref));
  form.querySelector("[data-guard]")?.addEventListener("click", (event) => {
    event.preventDefault();
    leave(listHref);
  });

  /* ---------- 검증 ---------- */
  function validate() {
    const errors = {};
    const title = titleInput.value.trim();
    if (!title) errors.title = "제목을 입력해주세요.";
    else if (title.length > BOARD.titleMax) errors.title = `제목은 ${BOARD.titleMax}자 이내로 입력해주세요.`;

    if (editor.isEmpty()) errors.content = "내용을 입력해주세요.";
    else if (editor.isOverLimit()) errors.content = `내용은 ${formatNumber(BOARD.contentMax)}자 이내로 입력해주세요. (현재 ${formatNumber(editor.getLength())}자)`;

    const total = existing.length + pendingFiles.length;
    if (total > BOARD.attachments.maxCount) errors.files = `첨부파일은 최대 ${BOARD.attachments.maxCount}개까지 등록할 수 있습니다.`;

    ["title", "content", "files"].forEach((name) => showError(name, errors[name]));
    const first = Object.keys(errors)[0];
    if (first === "title") titleInput.focus();
    else if (first === "content") editor.focus();
    return Object.keys(errors).length === 0;
  }

  /* ---------- 제출 ---------- */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;
    if (!validate()) return;

    submitButton.disabled = true;
    submitButton.textContent = isEdit ? "수정 중..." : "등록 중...";
    const uploaded = [];

    try {
      for (const file of pendingFiles) uploaded.push(await attachmentService.upload(file));

      const base = {
        title: titleInput.value.trim(),
        content: sanitizeHtml(editor.getHtml()),
        category: form.elements.category.value,
        isImportant: form.elements.isImportant.checked,
        attachments: [...existing, ...uploaded],
      };

      let savedId;
      if (isEdit) {
        const saved = await noticeService.update(notice.id, base, {
          touchUpdatedAt: form.elements.touchUpdatedAt.checked,
        });
        savedId = saved.id;
        await Promise.allSettled(removedExisting.map((meta) => attachmentService.remove(meta)));
      } else {
        const saved = await noticeService.create({ ...base, author: { ...CURRENT_USER } });
        savedId = saved.id;
      }

      dirty = false;
      navigate(buildHash(`/view/${savedId}`, { ...listParams, noinc: 1 }));
    } catch (error) {
      console.error("Failed to save notice", error);
      await Promise.allSettled(uploaded.map((meta) => attachmentService.remove(meta))); // 업로드된 파일 정리
      formError.textContent = error?.message?.includes("저장 공간")
        ? error.message
        : "저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
      formError.hidden = false;
      submitButton.disabled = false;
      submitButton.textContent = isEdit ? "수정완료" : "등록";
      formError.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  return () => editor.destroy();
}
