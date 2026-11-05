/**
 * 해시 라우터 유틸.   #/            목록
 *                    #/view/:id    상세
 *                    #/write       글쓰기
 *                    #/edit/:id    글수정
 * 목록 조건(page, category, q)은 쿼리스트링으로 모든 화면에 들고 다녀 "목록으로" 복귀 시 유지한다.
 */
export function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  return { path: path || "/", params: new URLSearchParams(query) };
}

export function buildHash(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return `#${path}${query ? `?${query}` : ""}`;
}

/** 목록 조건만 추려낸다 */
export function pickListParams(params) {
  const category = params.get("category");
  return {
    page: Number(params.get("page")) > 1 ? Number(params.get("page")) : undefined,
    category: category && category !== "all" ? category : undefined,
    q: params.get("q") || undefined,
  };
}

export const navigate = (hash) => {
  location.hash = hash;
};
