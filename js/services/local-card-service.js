import recommendedCards from '../../data/recommended-cards.json' with { type: 'json' };
import { getCardValue, setCardValue } from './card-storage-helper.js';

const CATALOG_KEY = 'catalog';
const CART_KEY = 'cart';

async function getCatalog() {
  const storedCatalog = await getCardValue(CATALOG_KEY, null);
  if (storedCatalog !== null) return storedCatalog;

  const catalog = structuredClone(recommendedCards);
  await setCardValue(CATALOG_KEY, catalog);
  return catalog;
}

async function getCartItems() {
  const items = await getCardValue(CART_KEY, []);
  if (!Array.isArray(items)) {
    throw new Error('장바구니 데이터 형식이 올바르지 않습니다.');
  }
  return items;
}

export const localCardService = {
  async getAllProducts() {
    return getCatalog();
  },

  async getProductById(id) {
    const catalog = await getCatalog();
    return catalog.find((product) => product.id === id) ?? null;
  },

  async getCart() {
    return getCartItems();
  },

  async getCartCount() {
    return (await getCartItems()).length;
  },

  async addToCart(id) {
    const [catalog, cart] = await Promise.all([getCatalog(), getCartItems()]);
    const product = catalog.find((item) => item.id === id);
    if (!product) throw new Error('장바구니에 담을 카드를 찾을 수 없습니다.');
    if (cart.some((item) => item.id === id)) return false;

    await setCardValue(CART_KEY, [...cart, product]);
    return true;
  },

  async removeFromCart(id) {
    const cart = await getCartItems();
    const nextCart = cart.filter((item) => item.id !== id);
    if (nextCart.length === cart.length) {
      throw new Error('장바구니에서 삭제할 카드를 찾을 수 없습니다.');
    }

    await setCardValue(CART_KEY, nextCart);
  },
};
