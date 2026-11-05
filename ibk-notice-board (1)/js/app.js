/**
 * 공지사항 게시판 진입 스크립트 (notice.html).
 * 해시 라우터로 4개 화면을 전환한다.   #/ · #/view/:id · #/write · #/edit/:id
 */
import { parseHash } from "./utils/router.js";
import { renderNoticeList } from "./pages/noticeList.js";
import { renderNoticeView } from "./pages/noticeView.js";
import { renderNoticeForm } from "./pages/noticeForm.js";
import { renderMessageCard, mountShell } from "./components/pageShell.js";

const root = document.querySelector("#notice-app");
let renderToken = 0;
let cleanup = null;

async function route() {
  const token = ++renderToken;
  const isCurrent = () => token === renderToken;
  const { path, params } = parseHash();

  cleanup?.(); // 이전 화면 정리(에디터 전체화면 해제 등)
  cleanup = null;
  window.scrollTo({ top: 0 });

  try {
    let result;
    const view = path.match(/^\/view\/([^/]+)$/);
    const edit = path.match(/^\/edit\/([^/]+)$/);

    if (view) result = await renderNoticeView(root, { params, isCurrent, id: decodeURIComponent(view[1]) });
    else if (edit) result = await renderNoticeForm(root, { params, isCurrent, mode: "edit", id: decodeURIComponent(edit[1]) });
    else if (path === "/write") result = await renderNoticeForm(root, { params, isCurrent, mode: "write" });
    else result = await renderNoticeList(root, { params, isCurrent });

    if (typeof result === "function") {
      if (isCurrent()) cleanup = result;
      else result();
    }
  } catch (error) {
    console.error("Unexpected render error", error);
    if (!isCurrent()) return;
    renderMessageCard(mountShell(root), {
      title: "화면을 표시하지 못했습니다.",
      message: "새로고침 후 다시 시도해주세요.",
      actionHref: "#/",
      actionLabel: "목록으로",
    });
  }
}

window.addEventListener("hashchange", route);
route();
