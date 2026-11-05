/**
 * 공지사항 서비스 진입점.
 * UI 는 반드시 이 파일의 `noticeService` 만 import 한다. (mock / firebase 구현체 직접 import 금지)
 *
 * Firebase 전환 시 아래 두 줄만 바꾼다.
 */

// [기존 LocalStorage 모드]
export { noticeMockService as noticeService } from "./mock/noticeMockService.js";

// [Firebase Firestore 전환]
// export { noticeFirebaseService as noticeService } from "./firebase/noticeFirebaseService.js";
