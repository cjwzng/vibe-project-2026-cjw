/**
 * <dialog> 기반 공용 다이얼로그 (confirm / alert / form).
 * window.confirm 대신 사용해 디자인을 통일하고 접근성(포커스 트랩, Esc)을 확보한다.
 */
import { escapeHtml } from "../utils/format.js";

function mountDialog(html) {
  const dialog = document.createElement("dialog");
  dialog.className = "app-dialog";
  dialog.innerHTML = html;
  document.body.append(dialog);
  return dialog;
}

/** @returns {Promise<boolean>} */
export function confirmDialog({
  title = "확인",
  message,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
}) {
  return new Promise((resolve) => {
    const dialog = mountDialog(`
      <form class="app-dialog__panel" method="dialog">
        <h2 class="app-dialog__title">${escapeHtml(title)}</h2>
        <p class="app-dialog__message">${escapeHtml(message)}</p>
        <div class="app-dialog__actions">
          ${cancelText ? `<button type="button" class="btn" data-act="cancel">${escapeHtml(cancelText)}</button>` : ""}
          <button type="submit" class="btn ${danger ? "btn--danger" : "btn--primary"}" data-act="ok">${escapeHtml(confirmText)}</button>
        </div>
      </form>`);

    let result = false;
    dialog.addEventListener("close", () => {
      dialog.remove();
      resolve(result);
    });
    dialog.querySelector("[data-act=cancel]")?.addEventListener("click", () => dialog.close());
    dialog.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      result = true;
      dialog.close();
    });

    dialog.showModal();
    dialog.querySelector(danger ? "[data-act=cancel]" : "[data-act=ok]").focus();
  });
}

export const alertDialog = (message, title = "알림") =>
  confirmDialog({ title, message, cancelText: null });

/**
 * 입력 폼 다이얼로그.
 * @param {{title:string, submitText?:string, fields:Array<{name:string,label:string,type?:string,value?:string|number,
 *   placeholder?:string,required?:boolean,min?:number,max?:number}>, validate?:(values:Record<string,string>)=>Record<string,string>|null}} options
 * @returns {Promise<Record<string,string>|null>} 취소 시 null
 */
export function formDialog({ title, submitText = "확인", fields, validate }) {
  return new Promise((resolve) => {
    const fieldsHtml = fields
      .map(
        (f) => `
        <div class="app-dialog__field">
          <label for="dlg-${f.name}">${escapeHtml(f.label)}${f.required ? ' <span class="required">*</span>' : ""}</label>
          <input id="dlg-${f.name}" name="${f.name}" type="${f.type ?? "text"}" value="${escapeHtml(f.value ?? "")}"
            ${f.placeholder ? `placeholder="${escapeHtml(f.placeholder)}"` : ""}
            ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""}
            autocomplete="off">
          <p class="field-error" data-error-for="${f.name}" role="alert" hidden></p>
        </div>`,
      )
      .join("");

    const dialog = mountDialog(`
      <form class="app-dialog__panel" method="dialog" novalidate>
        <h2 class="app-dialog__title">${escapeHtml(title)}</h2>
        ${fieldsHtml}
        <div class="app-dialog__actions">
          <button type="button" class="btn" data-act="cancel">취소</button>
          <button type="submit" class="btn btn--primary">${escapeHtml(submitText)}</button>
        </div>
      </form>`);

    let result = null;
    const form = dialog.querySelector("form");

    dialog.addEventListener("close", () => {
      dialog.remove();
      resolve(result);
    });
    dialog.querySelector("[data-act=cancel]").addEventListener("click", () => dialog.close());

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      const errors = {};
      fields.forEach((f) => {
        if (f.required && !String(values[f.name] ?? "").trim()) errors[f.name] = `${f.label}을(를) 입력해주세요.`;
      });
      Object.assign(errors, validate?.(values) ?? {});

      form.querySelectorAll("[data-error-for]").forEach((el) => {
        const message = errors[el.dataset.errorFor];
        el.textContent = message ?? "";
        el.hidden = !message;
      });
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        form.querySelector(`[name="${firstInvalid}"]`).focus();
        return;
      }
      result = values;
      dialog.close();
    });

    dialog.showModal();
    form.querySelector("input")?.focus();
  });
}
