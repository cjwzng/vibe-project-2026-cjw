/**
 * 공지사항 게시판 공통 설정값.
 * UI/서비스 어디서든 이 파일의 상수만 참조한다. (매직 넘버 금지)
 */
export const BOARD = {
  pageSize: 7, // 목록 1페이지당 게시물 수 (시안 기준 7건)
  pageBlockSize: 10, // 페이지네이션에 한 번에 보여줄 페이지 번호 수
  newBadgeDays: 3, // 등록 후 N일 이내 글에 NEW 뱃지
  titleMax: 100,
  contentMax: 5000,
  attachments: {
    maxCount: 5,
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedExt: ["jpg", "jpeg", "png", "pdf", "zip"],
    accept: ".jpg,.jpeg,.png,.pdf,.zip",
  },
};

/** 공지유형 (분류) */
export const NOTICE_CATEGORIES = [
  { value: "general", label: "일반공지" },
  { value: "event", label: "이벤트안내" },
  { value: "system", label: "시스템점검" },
  { value: "etc", label: "기타" },
];

export const categoryLabel = (value) =>
  NOTICE_CATEGORIES.find((c) => c.value === value)?.label ?? "기타";

/**
 * 현재 로그인 사용자 (임시 고정값).
 * TODO(Firebase 전환): Firebase Auth의 currentUser 로 교체.
 */
export const CURRENT_USER = { id: "admin", name: "IBK기업은행" };
