import { initNoticeBoard } from "./modules/notice-board.js";
import { initCardShop } from "./modules/card-shop.js";
import { noticeService } from "./services/notice-service.js";
import { cardService } from "./services/card-service.js";

const menuTrigger = document.querySelector(".all-menu-link");
const desktopMenu = document.querySelector("#desktop-global-menu");
const mobileMenu = document.querySelector("#mobile-global-menu");
const searchTrigger = document.querySelector(".search-button");
const searchOverlay = document.querySelector("#search-modal-overlay");
const searchCloseBtn = document.querySelector(".search-modal-close-btn");
const headerContent = document.querySelector(".site-header > .inner-box");
const mainContent = document.querySelector("main");
const footerContent = document.querySelector(".site-footer");
const noticeAnnouncement = document.querySelector("[data-notice-announcement]");
const noticeAnnouncementClose = noticeAnnouncement?.querySelector(".notice-announcement-close");
const cartLink = document.querySelector(".cart-link");
const cartCount = document.querySelector("[data-cart-count]");
const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
let isMobileViewport = mobileBreakpoint.matches;
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

let isMenuOpen = false;
let isSearchOpen = false;
let previousInertStates = [];

async function loadLatestNoticeAnnouncement() {
  const message = noticeAnnouncement?.querySelector(".notice-announcement-message");
  if (!message) return;

  try {
    const notices = await noticeService.getAll();
    const latestNotice = notices.reduce((latest, notice) => {
      if (!latest || new Date(notice.createdAt) > new Date(latest.createdAt)) return notice;
      return latest;
    }, null);

    if (!latestNotice) {
      message.textContent = "등록된 공지사항이 없습니다.";
      message.href = "#/notice";
      return;
    }

    message.textContent = latestNotice.title;
    message.href = `#/notice/${encodeURIComponent(latestNotice.id)}`;
  } catch (error) {
    message.textContent = error.message || "공지사항을 불러오지 못했습니다.";
    message.href = "#/notice";
  }
}

loadLatestNoticeAnnouncement();
window.addEventListener("notice-data-changed", loadLatestNoticeAnnouncement);

async function updateCartCount() {
  if (!cartCount || !cartLink) return;
  try {
    const count = await cardService.getCartCount();
    cartCount.textContent = String(count);
    cartCount.hidden = count === 0;
    cartLink.setAttribute("aria-label", count ? `장바구니, ${count}개 카드` : "장바구니");
    cartLink.removeAttribute("title");
  } catch (error) {
    cartCount.textContent = "!";
    cartCount.hidden = false;
    cartLink.setAttribute("aria-label", "장바구니 수를 불러오지 못했습니다.");
    cartLink.title = error.message || "장바구니 정보를 불러오지 못했습니다.";
  }
}

updateCartCount();
window.addEventListener("cart-updated", updateCartCount);

noticeAnnouncementClose?.addEventListener("click", () => {
  noticeAnnouncement.hidden = true;
});

function getActiveMenu() {
  return mobileBreakpoint.matches ? mobileMenu : desktopMenu;
}

function setBackgroundInert(isInert) {
  const backgroundElements = [noticeAnnouncement, headerContent, mainContent, footerContent];

  if (isInert) {
    previousInertStates = backgroundElements.map((element) => ({
      element,
      wasInert: element ? element.inert : false,
    }));
    backgroundElements.forEach((element) => {
      if (element) element.inert = true;
    });
    return;
  }

  previousInertStates.forEach(({ element, wasInert }) => {
    if (element) element.inert = wasInert;
  });
  previousInertStates = [];
}

function openMenu() {
  if (isMenuOpen) {
    return;
  }
  if (isSearchOpen) {
    closeSearch(false);
  }

  isMobileViewport = mobileBreakpoint.matches;
  const activeMenu = getActiveMenu();
  isMenuOpen = true;
  document.body.classList.add("global-menu-open");
  setBackgroundInert(true);
  activeMenu.inert = false;
  activeMenu.classList.add("is-open");
  menuTrigger.setAttribute("aria-expanded", "true");
  menuTrigger.setAttribute("aria-label", "전체 메뉴 닫기");
  const closeBtn = activeMenu.querySelector(".menu-close-button");
  if (closeBtn) closeBtn.focus();
}

function closeMenu(restoreFocus = true) {
  if (!isMenuOpen) {
    return;
  }

  isMenuOpen = false;
  desktopMenu.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");
  desktopMenu.inert = true;
  mobileMenu.inert = true;
  document.body.classList.remove("global-menu-open");
  setBackgroundInert(false);
  menuTrigger.setAttribute("aria-expanded", "false");
  menuTrigger.setAttribute("aria-label", "전체 메뉴 열기");

  if (restoreFocus) {
    menuTrigger.focus();
  }
}

function openSearch() {
  if (isSearchOpen) {
    return;
  }
  if (isMenuOpen) {
    closeMenu(false);
  }

  isSearchOpen = true;
  document.body.classList.add("search-modal-open");
  setBackgroundInert(true);
  searchOverlay.hidden = false;
  searchOverlay.inert = false;
  // Trigger transition
  requestAnimationFrame(() => {
    searchOverlay.classList.add("is-open");
  });
  searchTrigger.setAttribute("aria-expanded", "true");
  searchTrigger.setAttribute("aria-label", "통합검색 닫기");

  const searchInput = searchOverlay.querySelector(".search-main-input");
  if (searchInput) {
    searchInput.focus();
  }
}

function closeSearch(restoreFocus = true) {
  if (!isSearchOpen) {
    return;
  }

  isSearchOpen = false;
  searchOverlay.classList.remove("is-open");
  searchOverlay.inert = true;
  document.body.classList.remove("search-modal-open");
  setBackgroundInert(false);
  searchTrigger.setAttribute("aria-expanded", "false");
  searchTrigger.setAttribute("aria-label", "통합검색 열기");

  if (restoreFocus && searchTrigger) {
    searchTrigger.focus();
  }
}

if (searchOverlay) {
  searchOverlay.addEventListener("transitionend", (event) => {
    if (event.target === searchOverlay && !isSearchOpen) {
      searchOverlay.hidden = true;
    }
  });
}

if (menuTrigger) {
  menuTrigger.addEventListener("click", () => {
    if (isMenuOpen) {
      closeMenu();
      return;
    }
    openMenu();
  });
}

if (searchTrigger) {
  searchTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    if (isSearchOpen) {
      closeSearch();
      return;
    }
    openSearch();
  });
}

const siteSearchForm = document.querySelector(".site-search");
if (siteSearchForm) {
  siteSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openSearch();
  });
}

if (searchCloseBtn) {
  searchCloseBtn.addEventListener("click", () => {
    closeSearch();
  });
}

document.querySelectorAll(".menu-close-button, .mobile-menu-backdrop").forEach((button) => {
  button.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (!isMenuOpen && !isSearchOpen) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    if (isSearchOpen) {
      closeSearch();
    } else {
      closeMenu();
    }
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const activePanel = isSearchOpen ? searchOverlay : getActiveMenu();
  const focusableElements = [...activePanel.querySelectorAll(focusableSelector)]
    .filter((element) => element.tabIndex >= 0 && !element.closest("[hidden]"));
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    if (lastElement) lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    if (firstElement) firstElement.focus();
  }
});

document.querySelectorAll(".mobile-menu-item > button").forEach((button) => {
  button.addEventListener("click", () => {
    const submenu = document.getElementById(button.getAttribute("aria-controls"));
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    if (submenu) submenu.hidden = isExpanded;
  });
});

document.querySelectorAll(".desktop-global-menu a, .mobile-global-menu a").forEach((link) => {
  link.addEventListener("click", () => closeMenu(false));
});

function handleViewportChange() {
  const isMobile = mobileBreakpoint.matches;

  if (isMobile === isMobileViewport) {
    return;
  }

  isMobileViewport = isMobile;
  closeMenu(false);
}

mobileBreakpoint.addEventListener("change", handleViewportChange);
window.addEventListener("resize", handleViewportChange);

initNoticeBoard();
initCardShop();
