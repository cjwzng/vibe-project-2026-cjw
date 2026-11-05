/**
 * Firebase 초기화 (전환 시점에만 사용 – 현재 Mock 모드에서는 어디서도 import 하지 않는다)
 *
 * 번들러(Vite 등)를 쓰는 경우 CDN URL 대신 `firebase/app`, `firebase/firestore`, `firebase/storage` 로 바꿔 import 한다.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

// TODO: Firebase 콘솔 > 프로젝트 설정 > 내 앱 에서 복사한 값으로 교체
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
