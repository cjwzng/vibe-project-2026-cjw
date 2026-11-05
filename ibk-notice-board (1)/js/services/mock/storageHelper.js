/**
 * localStorage 유틸 (Mock DB 전용).
 * - 지침에 따라 모든 함수는 async(Promise) 로 선언한다.
 * - 실제 네트워크처럼 150ms 지연을 주어 로딩/스켈레톤 UI 를 검증할 수 있게 한다.
 * - UI 컴포넌트에서 직접 import 하지 않는다. (services/mock/* 내부에서만 사용)
 */
const LATENCY_MS = 150;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const storageHelper = {
  get: async (key, defaultValue) => {
    await delay(LATENCY_MS); // 네트워크 레이턴시 시뮬레이션
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item);
    } catch {
      return defaultValue; // 손상된 데이터는 기본값으로 복구
    }
  },

  set: async (key, value) => {
    await delay(LATENCY_MS);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // 용량 초과(QuotaExceededError) 등을 서비스 계층 에러로 통일
      throw new Error("저장 공간이 부족하여 저장하지 못했습니다.", { cause: error });
    }
  },

  /** 키 존재 여부 (지연 없음 – 내부 플래그 확인용) */
  has: async (key) => localStorage.getItem(key) !== null,

  remove: async (key) => {
    await delay(LATENCY_MS);
    localStorage.removeItem(key);
  },
};
