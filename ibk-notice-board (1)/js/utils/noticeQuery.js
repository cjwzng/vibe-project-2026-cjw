/**
 * 목록 화면용 정렬·필터·페이지 계산 (순수 함수).
 * 지침: 복잡한 쿼리/조인을 서비스에 만들지 않고, getAll() 결과를 화면 단위로 가공한다.
 */

/** 중요공지 먼저 → 등록일 최신순 → 게시번호 큰 순 */
export function sortNotices(list) {
  return [...list].sort(
    (a, b) =>
      Number(b.isImportant) - Number(a.isImportant) ||
      b.createdAt.localeCompare(a.createdAt) ||
      (b.postNo ?? 0) - (a.postNo ?? 0),
  );
}

export function filterNotices(list, { category = "all", q = "" } = {}) {
  const keyword = q.trim().toLowerCase();
  return list.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (!keyword || item.title.toLowerCase().includes(keyword)),
  );
}

export function paginate(list, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return { items: list.slice(start, start + pageSize), total: list.length, totalPages, page: current };
}

/** 페이지 번호 블록(1~10, 11~20 …)의 시작/끝 */
export function getPageWindow(page, totalPages, blockSize) {
  const start = Math.floor((page - 1) / blockSize) * blockSize + 1;
  return { start, end: Math.min(start + blockSize - 1, totalPages) };
}
