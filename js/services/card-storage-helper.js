const STORAGE_PREFIX = 'ibk:cards:';

export async function getCardValue(key, fallbackValue) {
  try {
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
  } catch (error) {
    throw new Error('카드 정보를 읽지 못했습니다. 브라우저 저장 공간을 확인해 주세요.', { cause: error });
  }
}

export async function setCardValue(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    throw new Error('카드 정보를 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.', { cause: error });
  }
}
