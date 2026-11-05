/**
 * 고유 ID 생성. 지침: 증가 숫자(1,2,3…) 금지, crypto.randomUUID() 사용.
 * randomUUID 는 보안 컨텍스트(https / localhost)에서만 제공되므로 폴백을 둔다.
 */
export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
