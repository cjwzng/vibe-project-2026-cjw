/**
 * 첨부파일 서비스 진입점.
 * UI 는 반드시 이 파일의 `attachmentService` 만 import 한다.
 *
 * ★ Firebase Storage 전환 시 아래 두 줄만 바꾼다.
 */

// [기존 LocalStorage 모드 – 메타데이터 중심]
export { attachmentMockStorage as attachmentService } from "./mock/attachmentMockStorage.js";

// [Firebase Storage 전환]
// export { attachmentFirebaseStorage as attachmentService } from "./firebase/attachmentFirebaseStorage.js";
