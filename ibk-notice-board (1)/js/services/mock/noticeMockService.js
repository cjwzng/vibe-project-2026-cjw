/**
 * 공지사항 Mock 서비스 (localStorage 구현체).
 * - noticeFirebaseService 와 동일한 인터페이스(types/notice.js 참고)를 따른다.
 * - 모든 함수는 async. 없는 데이터는 getById/increaseViewCount → null, update → throw Error 로 통일.
 */
import { storageHelper } from "./storageHelper.js";
import { buildSeedNotices } from "./noticeSeed.js";
import { newId } from "../../utils/id.js";

const STORAGE_KEY = "mock_notices";
const SEED_FLAG_KEY = "mock_notices_seeded"; // 전부 삭제해도 시드가 다시 생기지 않게 하는 플래그

/** 읽기-수정-쓰기 구간을 직렬화해서 동시 호출 시 데이터 덮어쓰기를 막는다. */
let writeQueue = Promise.resolve();
function serialize(task) {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => {});
  return run;
}

let seedPromise = null;
function ensureSeeded() {
  seedPromise ??= (async () => {
    if (await storageHelper.has(SEED_FLAG_KEY)) return;
    await storageHelper.set(STORAGE_KEY, buildSeedNotices());
    await storageHelper.set(SEED_FLAG_KEY, true);
  })();
  return seedPromise;
}

async function loadAll() {
  await ensureSeeded();
  return storageHelper.get(STORAGE_KEY, []);
}

export const noticeMockService = {
  getAll: async () => loadAll(),

  getById: async (id) => {
    const list = await loadAll();
    return list.find((item) => item.id === id) || null;
  },

  create: async (dto) =>
    serialize(async () => {
      const list = await loadAll();
      const now = new Date().toISOString();
      // postNo: 화면 표시용 번호. id 와 별개이며 Firestore 전환 시 카운터 문서+트랜잭션으로 대체.
      const nextPostNo = list.reduce((max, item) => Math.max(max, item.postNo ?? 0), 0) + 1;
      const notice = {
        ...dto,
        id: newId(), // Firestore 의 고유 ID 처럼 영숫자 고유 식별자 사용
        postNo: nextPostNo,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      list.unshift(notice);
      await storageHelper.set(STORAGE_KEY, list);
      return notice;
    }),

  /**
   * @param {string} id
   * @param {import('../../types/notice.js').UpdateNoticeDto} dto
   * @param {import('../../types/notice.js').UpdateOptions} [options]
   *   touchUpdatedAt=false 이면 수정일(updatedAt)을 유지한다. (글수정 화면의 "수정일 갱신" 체크박스)
   */
  update: async (id, dto, { touchUpdatedAt = true } = {}) =>
    serialize(async () => {
      const list = await loadAll();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`Notice ${id} not found`);

      const updated = {
        ...list[index],
        ...dto,
        updatedAt: touchUpdatedAt ? new Date().toISOString() : list[index].updatedAt,
      };
      list[index] = updated;
      await storageHelper.set(STORAGE_KEY, list);
      return updated;
    }),

  delete: async (id) =>
    serialize(async () => {
      const list = await loadAll();
      await storageHelper.set(
        STORAGE_KEY,
        list.filter((item) => item.id !== id),
      );
    }),

  /** 상세 진입 시 조회수 +1 후 갱신된 문서를 반환 */
  increaseViewCount: async (id) =>
    serialize(async () => {
      const list = await loadAll();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], viewCount: (list[index].viewCount ?? 0) + 1 };
      await storageHelper.set(STORAGE_KEY, list);
      return list[index];
    }),
};
