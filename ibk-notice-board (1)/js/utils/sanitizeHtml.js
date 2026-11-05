/**
 * 리치 텍스트(HTML) 정제기 – 허용 목록(allowlist) 방식.
 * 저장 직전과 화면 출력 직전에 모두 적용해 XSS 를 막는다.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "div", "span", "b", "strong", "i", "em", "u", "s", "strike", "del",
  "h1", "h2", "h3", "h4", "blockquote", "hr", "ul", "ol", "li", "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "colgroup", "col",
]);

/** 내용까지 통째로 제거할 태그 */
const DROP_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "svg", "math", "form", "input", "textarea",
  "select", "button", "link", "meta", "noscript", "template", "audio", "video", "canvas",
]);

const ALLOWED_ATTRS = {
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "width", "height", "title"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const ALLOWED_STYLES = new Set([
  "color", "background-color", "text-align", "font-weight", "font-style", "text-decoration", "text-decoration-line",
]);

const SAFE_STYLE_VALUE = /^[#a-z0-9(),.%\s-]+$/i;
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|#|\/)/i;
const SAFE_IMG_SRC = /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);base64,)/i;

function cleanStyle(value) {
  return value
    .split(";")
    .map((rule) => rule.split(":").map((part) => part.trim()))
    .filter(([prop, val]) => prop && val && ALLOWED_STYLES.has(prop.toLowerCase()) && SAFE_STYLE_VALUE.test(val))
    .map(([prop, val]) => `${prop.toLowerCase()}: ${val}`)
    .join("; ");
}

function cleanAttributes(element, tag) {
  const allowed = ALLOWED_ATTRS[tag] ?? [];
  [...element.attributes].forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name === "style") {
      const style = cleanStyle(attr.value);
      if (style) element.setAttribute("style", style);
      else element.removeAttribute("style");
      return;
    }
    if (!allowed.includes(name)) {
      element.removeAttribute(attr.name);
      return;
    }
    if (name === "href" && !SAFE_HREF.test(attr.value.trim())) element.removeAttribute(attr.name);
    if (name === "src" && !SAFE_IMG_SRC.test(attr.value.trim())) element.removeAttribute(attr.name);
  });

  if (tag === "a" && element.hasAttribute("href") && /^https?:/i.test(element.getAttribute("href"))) {
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noopener noreferrer");
  }
}

function clean(parent) {
  [...parent.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (DROP_TAGS.has(tag)) {
      node.remove();
      return;
    }
    clean(node);
    if (!ALLOWED_TAGS.has(tag)) {
      node.replaceWith(...node.childNodes); // 허용되지 않은 태그는 껍데기만 벗김
      return;
    }
    cleanAttributes(node, tag);
  });
}

export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(`<body>${html ?? ""}</body>`, "text/html");
  clean(doc.body);
  return doc.body.innerHTML;
}
