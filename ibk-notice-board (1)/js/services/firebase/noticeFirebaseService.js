/**
 * 공지사항 Firestore 구현체.
 * noticeMockService 와 "동일한 인터페이스·반환 형태"를 유지한다. (UI 수정 없이 교체되도록)
 *
 * 컬렉션: notices/{id}   (id 는 문서 ID 이므로 문서 필드에는 저장하지 않는다)
 * 카운터: counters/notices { last: number }   ← postNo 채번용
 *
 * 참고) 지침 예시의 update() 는 Promise<void> 였지만 Mock 은 Promise<Notice> 를 반환하므로,
 *       계약을 통일하기 위해 여기서도 갱신된 문서를 반환한다.
 */
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  runTransaction,
  increment,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

const COLLECTION_NAME = "notices";
const COUNTER_REF = () => doc(db, "counters", COLLECTION_NAME);

const toNotice = (snap) => ({ id: snap.id, ...snap.data() });

async function fetchOne(id) {
  const snap = await getDoc(doc(db, COLLECTION_NAME, id));
  return snap.exists() ? toNotice(snap) : null;
}

export const noticeFirebaseService = {
  getAll: async () => {
    const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc")));
    return snapshot.docs.map(toNotice);
  },

  getById: async (id) => fetchOne(id),

  create: async (dto) => {
    const nowIso = new Date().toISOString();

    // postNo 채번 (동시 등록에도 중복되지 않도록 트랜잭션 사용)
    const postNo = await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(COUNTER_REF());
      const next = (counterSnap.exists() ? counterSnap.data().last : 0) + 1;
      tx.set(COUNTER_REF(), { last: next });
      return next;
    });

    const data = { ...dto, postNo, viewCount: 0, createdAt: nowIso, updatedAt: nowIso };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return { id: docRef.id, ...data };
  },

  update: async (id, dto, { touchUpdatedAt = true } = {}) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const current = await getDoc(docRef);
    if (!current.exists()) throw new Error(`Notice ${id} not found`);

    await updateDoc(docRef, {
      ...dto,
      ...(touchUpdatedAt ? { updatedAt: new Date().toISOString() } : {}),
    });
    return fetchOne(id);
  },

  delete: async (id) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  increaseViewCount: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const current = await getDoc(docRef);
    if (!current.exists()) return null;
    await updateDoc(docRef, { viewCount: increment(1) }); // 원자적 증가
    return fetchOne(id);
  },
};
