/**
 * 첨부파일 Firebase Storage 구현체 (attachmentMockStorage 와 동일한 인터페이스).
 * 문서(Firestore)에는 여전히 메타데이터만 저장하고, 파일 본문은 Storage 에 올린다.
 */
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { storage } from "./firebaseConfig.js";
import { newId } from "../../utils/id.js";

export const attachmentFirebaseStorage = {
  upload: async (file) => {
    const id = newId();
    const storagePath = `notice-attachments/${id}/${file.name}`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return {
      id,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      storagePath,
      url: await getDownloadURL(fileRef),
    };
  },

  getDownloadUrl: async (meta) => meta.url ?? getDownloadURL(ref(storage, meta.storagePath)),

  remove: async (meta) => {
    try {
      await deleteObject(ref(storage, meta.storagePath));
    } catch (error) {
      if (error?.code !== "storage/object-not-found") throw error;
    }
  },

  /** 에디터 본문 이미지: Storage 업로드 후 다운로드 URL 반환 (dataURL 을 문서에 넣지 않는다) */
  uploadInlineImage: async (file) => {
    const storagePath = `notice-inline-images/${newId()}/${file.name}`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return getDownloadURL(fileRef);
  },
};
