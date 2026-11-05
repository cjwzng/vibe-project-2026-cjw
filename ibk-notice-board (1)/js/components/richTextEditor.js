/**
 * 리치 텍스트 에디터 (contenteditable + execCommand, 외부 라이브러리 없음).
 *
 * 기능: 문단 · 굵게 · 기울임 · 밑줄 · 취소선 · 글자색 · 배경색 · 정렬 · 목록 · 링크 · 이미지 · 표 · 서식제거 · 전체화면
 *       + 글자수 카운터(0 / max)
 *
 * 저장소(localStorage/Firebase)를 직접 알지 못한다. 이미지 업로드는 옵션 `uploadImage(file)` 로 주입받는다.
 */
import { icons } from "./icons.js";
import { formDialog, alertDialog } from "./dialog.js";
import { escapeHtml, formatNumber } from "../utils/format.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";

const COLORS = ["#000000", "#555555", "#999999", "#d33a3a", "#e8710a", "#f2b705", "#2e9e57", "#1e6bd6", "#6a3fd1", "#ffffff"];
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const SAFE_URL = /^(https?:\/\/|mailto:|tel:)/i;

const STATE_COMMANDS = [
  "bold", "italic", "underline", "strikeThrough",
  "justifyLeft", "justifyCenter", "justifyRight",
  "insertUnorderedList", "insertOrderedList",
];

const toolbarButton = (cmd, label, content, extra = "") =>
  `<button type="button" class="rte-btn" data-cmd="${cmd}" title="${label}" aria-label="${label}" aria-pressed="false" ${extra}>${content}</button>`;

const colorMenu = (kind, label, icon) => `
  <div class="rte-color" data-color-kind="${kind}">
    <button type="button" class="rte-btn" data-color-toggle title="${label}" aria-label="${label}" aria-haspopup="true" aria-expanded="false">${icon}</button>
    <div class="rte-color__menu" role="menu" hidden>
      ${COLORS.map((c) => `<button type="button" class="rte-swatch" role="menuitem" data-color="${c}" style="background:${c}" aria-label="${label} ${c}"></button>`).join("")}
      <button type="button" class="rte-color__reset" role="menuitem" data-color="">기본</button>
    </div>
  </div>`;

/**
 * @param {HTMLElement} root
 * @param {{placeholder?:string,maxLength?:number,initialHtml?:string,labelledBy?:string,
 *          uploadImage?:(file:File)=>Promise<string>,onChange?:()=>void}} options
 */
export function createRichTextEditor(root, options = {}) {
  const { placeholder = "", maxLength = 5000, initialHtml = "", labelledBy, uploadImage, onChange } = options;

  root.innerHTML = `
    <div class="rte">
      <div class="rte-toolbar" role="toolbar" aria-label="서식 도구">
        <select class="rte-select" data-block aria-label="문단 서식">
          <option value="p">문단</option>
          <option value="h2">제목 1</option>
          <option value="h3">제목 2</option>
          <option value="h4">제목 3</option>
          <option value="blockquote">인용</option>
        </select>
        <span class="rte-sep" aria-hidden="true"></span>
        ${toolbarButton("bold", "굵게", "<b>B</b>")}
        ${toolbarButton("italic", "기울임", "<i>I</i>")}
        ${toolbarButton("underline", "밑줄", "<u>U</u>")}
        ${toolbarButton("strikeThrough", "취소선", "<s>S</s>")}
        ${colorMenu("fore", "글자색", icons.textColor())}
        ${colorMenu("back", "배경색", icons.highlight())}
        <span class="rte-sep" aria-hidden="true"></span>
        ${toolbarButton("justifyLeft", "왼쪽 정렬", icons.alignLeft())}
        ${toolbarButton("justifyCenter", "가운데 정렬", icons.alignCenter())}
        ${toolbarButton("justifyRight", "오른쪽 정렬", icons.alignRight())}
        <span class="rte-sep" aria-hidden="true"></span>
        ${toolbarButton("insertUnorderedList", "글머리 기호 목록", icons.listUl())}
        ${toolbarButton("insertOrderedList", "번호 목록", icons.listOl())}
        <span class="rte-sep" aria-hidden="true"></span>
        ${toolbarButton("link", "링크", icons.link())}
        ${toolbarButton("image", "이미지", icons.image())}
        ${toolbarButton("table", "표", icons.table())}
        ${toolbarButton("clear", "서식 제거", icons.eraser())}
        <span class="rte-spacer" aria-hidden="true"></span>
        ${toolbarButton("fullscreen", "전체화면", icons.expand())}
        <input type="file" class="visually-hidden" data-image-input accept="image/png,image/jpeg" tabindex="-1" aria-hidden="true">
      </div>
      <div class="rte-area rich-content" contenteditable="true" role="textbox" aria-multiline="true"
           ${labelledBy ? `aria-labelledby="${labelledBy}"` : 'aria-label="내용"'}
           data-placeholder="${escapeHtml(placeholder)}"></div>
      <div class="rte-footer">
        <span class="rte-counter" aria-live="polite"><span data-count>0</span> / ${formatNumber(maxLength)}</span>
      </div>
    </div>`;

  const wrapper = root.querySelector(".rte");
  const toolbar = root.querySelector(".rte-toolbar");
  const area = root.querySelector(".rte-area");
  const counter = root.querySelector(".rte-counter");
  const countEl = root.querySelector("[data-count]");
  const imageInput = root.querySelector("[data-image-input]");
  const blockSelect = root.querySelector("[data-block]");
  const fullscreenBtn = root.querySelector('[data-cmd="fullscreen"]');

  // 빈 상태에서도 첫 줄이 <p> 로 생성되도록 기본 문단을 둔다.
  area.innerHTML = sanitizeHtml(initialHtml) || "<p><br></p>";
  try {
    document.execCommand("defaultParagraphSeparator", false, "p");
  } catch {
    /* 일부 브라우저 미지원 */
  }

  /* ---------- 상태 계산 ---------- */
  const getText = () => area.textContent.replace(/​/g, "");
  const getLength = () => getText().length;
  const isEmpty = () => !getText().trim() && !area.querySelector("img, table, hr");
  const getHtml = () => (isEmpty() ? "" : sanitizeHtml(area.innerHTML));

  function refresh() {
    const length = getLength();
    countEl.textContent = formatNumber(length);
    counter.classList.toggle("is-over", length > maxLength);
    area.classList.toggle("is-empty", isEmpty());
  }

  function changed() {
    refresh();
    onChange?.();
  }

  /* ---------- 선택 영역 보존 (툴바·다이얼로그로 포커스가 이동해도 유지) ---------- */
  let savedRange = null;
  const onSelectionChange = () => {
    const sel = document.getSelection();
    if (sel.rangeCount && area.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange();
    updateToolbarState();
  };
  document.addEventListener("selectionchange", onSelectionChange);

  function restoreSelection() {
    area.focus();
    if (!savedRange) return;
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  function exec(command, value = null) {
    restoreSelection();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command, false, value);
    changed();
  }

  function insertHtml(html) {
    restoreSelection();
    document.execCommand("insertHTML", false, sanitizeHtml(html));
    changed();
  }

  function updateToolbarState() {
    if (!area.contains(document.getSelection().anchorNode)) return;
    STATE_COMMANDS.forEach((cmd) => {
      const button = toolbar.querySelector(`[data-cmd="${cmd}"]`);
      if (button) button.setAttribute("aria-pressed", String(document.queryCommandState(cmd)));
    });
    const block = (document.queryCommandValue("formatBlock") || "p").toLowerCase().replace(/[<>]/g, "");
    blockSelect.value = [...blockSelect.options].some((o) => o.value === block) ? block : "p";
  }

  /* ---------- 링크 / 이미지 / 표 ---------- */
  async function insertLink() {
    savedRange = savedRange ?? null;
    const selectedText = String(document.getSelection());
    const values = await formDialog({
      title: "링크 삽입",
      submitText: "삽입",
      fields: [
        { name: "url", label: "주소(URL)", placeholder: "https://", required: true },
        ...(selectedText ? [] : [{ name: "text", label: "표시할 텍스트", placeholder: "비워두면 주소가 표시됩니다." }]),
      ],
      validate: ({ url }) => {
        const normalized = /^[a-z][a-z0-9+.-]*:/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
        return SAFE_URL.test(normalized) ? null : { url: "http, https, mailto, tel 주소만 사용할 수 있습니다." };
      },
    });
    restoreSelection();
    if (!values) return;

    const raw = values.url.trim();
    const url = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    if (selectedText) {
      exec("createLink", url);
    } else {
      insertHtml(`<a href="${escapeHtml(url)}">${escapeHtml(values.text?.trim() || url)}</a>`);
    }
  }

  async function insertImage(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      await alertDialog("JPG, PNG 이미지만 삽입할 수 있습니다.");
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      await alertDialog("이미지는 최대 10MB까지 삽입할 수 있습니다.");
      return;
    }
    try {
      // 저장소 구현은 주입받는다. (Mock: 축소 dataURL / Firebase: Storage URL)
      const src = await uploadImage(file);
      insertHtml(`<img src="${escapeHtml(src)}" alt="${escapeHtml(file.name)}">`);
    } catch (error) {
      console.error(error);
      await alertDialog("이미지를 삽입하지 못했습니다. 다시 시도해주세요.");
    }
  }

  async function insertTable() {
    const values = await formDialog({
      title: "표 삽입",
      submitText: "삽입",
      fields: [
        { name: "rows", label: "행 (1~10)", type: "number", value: 3, min: 1, max: 10, required: true },
        { name: "cols", label: "열 (1~6)", type: "number", value: 3, min: 1, max: 6, required: true },
      ],
      validate: ({ rows, cols }) => ({
        ...(rows >= 1 && rows <= 10 ? {} : { rows: "1~10 사이의 숫자를 입력해주세요." }),
        ...(cols >= 1 && cols <= 6 ? {} : { cols: "1~6 사이의 숫자를 입력해주세요." }),
      }),
    });
    if (!values) {
      restoreSelection();
      return;
    }
    const cell = "<td><br></td>";
    const row = `<tr>${cell.repeat(Number(values.cols))}</tr>`;
    insertHtml(`<table><tbody>${row.repeat(Number(values.rows))}</tbody></table><p><br></p>`);
  }

  function clearFormat() {
    restoreSelection();
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    document.execCommand("formatBlock", false, "p");
    changed();
  }

  /* ---------- 전체화면 ---------- */
  function setFullscreen(on) {
    wrapper.classList.toggle("is-fullscreen", on);
    document.body.classList.toggle("editor-fullscreen", on);
    fullscreenBtn.innerHTML = on ? icons.compress() : icons.expand();
    fullscreenBtn.setAttribute("aria-pressed", String(on));
    fullscreenBtn.title = fullscreenBtn.ariaLabel = on ? "전체화면 종료" : "전체화면";
    area.focus();
  }

  /* ---------- 색상 팝업 ---------- */
  const closeColorMenus = () =>
    toolbar.querySelectorAll(".rte-color__menu").forEach((menu) => {
      menu.hidden = true;
      menu.parentElement.querySelector("[data-color-toggle]").setAttribute("aria-expanded", "false");
    });

  function applyColor(kind, color) {
    if (kind === "fore") {
      exec("foreColor", color || "#333333");
    } else if (color) {
      exec("hiliteColor", color);
    } else {
      exec("hiliteColor", "transparent");
    }
    const bar = toolbar.querySelector(`[data-color-kind="${kind}"] .rte-color-bar`);
    if (bar) bar.style.stroke = color || "currentColor";
  }

  /* ---------- 이벤트 ---------- */
  // 버튼을 눌러도 에디터의 선택 영역/포커스가 사라지지 않게 한다. (select 는 예외)
  toolbar.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) event.preventDefault();
  });

  toolbar.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-color-toggle]");
    if (toggle) {
      const menu = toggle.nextElementSibling;
      const willOpen = menu.hidden;
      closeColorMenus();
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      return;
    }

    const swatch = event.target.closest("[data-color]");
    if (swatch) {
      applyColor(swatch.closest("[data-color-kind]").dataset.colorKind, swatch.dataset.color);
      closeColorMenus();
      return;
    }

    const button = event.target.closest("[data-cmd]");
    if (!button) return;
    closeColorMenus();
    const cmd = button.dataset.cmd;
    switch (cmd) {
      case "link": insertLink(); break;
      case "image": savedRange && restoreSelection(); imageInput.click(); break;
      case "table": insertTable(); break;
      case "clear": clearFormat(); break;
      case "fullscreen": setFullscreen(!wrapper.classList.contains("is-fullscreen")); break;
      default: exec(cmd);
    }
  });

  blockSelect.addEventListener("change", () => {
    exec("formatBlock", blockSelect.value);
  });

  imageInput.addEventListener("change", async () => {
    const [file] = imageInput.files;
    imageInput.value = "";
    await insertImage(file);
  });

  const onDocumentClick = (event) => {
    if (!event.target.closest(".rte-color")) closeColorMenus();
  };
  document.addEventListener("click", onDocumentClick);

  area.addEventListener("input", changed);
  area.addEventListener("blur", () => area.normalize());

  // 최대 글자수: 일반 타이핑은 막고, IME(한글 조합)는 막지 않되 카운터/등록 검증으로 알린다.
  area.addEventListener("beforeinput", (event) => {
    if (event.inputType === "insertText" && getLength() >= maxLength && document.getSelection().isCollapsed) {
      event.preventDefault();
    }
  });

  // 붙여넣기: 서식은 sanitize 해서 허용된 것만, 글자수 초과분은 잘라낸다.
  area.addEventListener("paste", (event) => {
    event.preventDefault();
    const clipboard = event.clipboardData;
    const html = clipboard.getData("text/html");
    const plain = clipboard.getData("text/plain");
    const selectedLength = String(document.getSelection()).length;
    const remaining = Math.max(0, maxLength - getLength() + selectedLength);

    const probe = document.createElement("div");
    probe.innerHTML = sanitizeHtml(html);
    if (html && probe.textContent.length <= remaining) {
      document.execCommand("insertHTML", false, probe.innerHTML);
    } else {
      document.execCommand("insertText", false, plain.slice(0, remaining));
    }
    changed();
  });

  // 파일/이미지 드롭으로 본문이 깨지는 것을 방지
  area.addEventListener("drop", (event) => event.preventDefault());

  area.addEventListener("focus", () => document.execCommand("styleWithCSS", false, true));

  wrapper.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && wrapper.classList.contains("is-fullscreen")) {
      event.stopPropagation();
      setFullscreen(false);
    }
  });

  refresh();

  return {
    getHtml,
    getText,
    getLength,
    isEmpty,
    isOverLimit: () => getLength() > maxLength,
    focus: () => area.focus(),
    destroy() {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("click", onDocumentClick);
      document.body.classList.remove("editor-fullscreen");
    },
  };
}
