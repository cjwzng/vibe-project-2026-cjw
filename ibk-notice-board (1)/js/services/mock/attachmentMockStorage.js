/**
 * 첨부파일 Mock 저장소.
 *
 * localStorage 용량(약 5MB) 한계 때문에 "메타데이터 중심"으로 저장한다.
 *  - 공지 문서에는 항상 메타데이터(AttachmentMeta)만 들어간다.
 *  - 파일 본문은 PERSIST_LIMIT_BYTES 이하일 때만 별도 키(mock_notice_files)에 dataURL 로 보관해
 *    다운로드를 체험할 수 있게 하고, 그보다 크면 본문은 저장하지 않는다. (다운로드 시 null 반환)
 *
 * ★ Firebase Storage 전환 지점: 이 파일 전체가 services/firebase/attachmentFirebaseStorage.js 로 대체된다.
 */
import { storageHelper } from "./storageHelper.js";
import { newId } from "../../utils/id.js";
import { readFileAsDataUrl, resizeImageToDataUrl } from "../../utils/image.js";

const FILES_KEY = "mock_notice_files";
const PERSIST_LIMIT_BYTES = 300 * 1024;

export const attachmentMockStorage = {
  /** @returns {Promise<import('../../types/notice.js').AttachmentMeta>} */
  upload: async (file) => {
    const id = newId();
    const meta = {
      id,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      storagePath: `mock/notice-attachments/${id}/${file.name}`, // ★ Firebase Storage 경로 규칙과 동일하게 유지
      url: null, // ★ Firebase 전환 후: getDownloadURL() 결과
    };

    if (file.size <= PERSIST_LIMIT_BYTES) {
      try {
        const files = await storageHelper.get(FILES_KEY, {});
        files[id] = await readFileAsDataUrl(file);
        await storageHelper.set(FILES_KEY, files);
      } catch {
        // 용량 초과 시 메타데이터만 유지 (다운로드 불가)
      }
    }
    return meta;
  },

  /** @returns {Promise<string|null>} 다운로드 가능한 URL, 없으면 null */
  getDownloadUrl: async (meta) => {
    if (meta.url) return meta.url;
    const files = await storageHelper.get(FILES_KEY, {});
    return files[meta.id] ?? null;
  },

  remove: async (meta) => {
    const files = await storageHelper.get(FILES_KEY, {});
    if (!(meta.id in files)) return;
    delete files[meta.id];
    await storageHelper.set(FILES_KEY, files);
  },

  /** 에디터 본문에 삽입하는 이미지 → 축소한 dataURL 반환. ★ Firebase 전환 시 Storage 업로드 후 URL 반환 */
  uploadInlineImage: async (file) => resizeImageToDataUrl(file),
};
