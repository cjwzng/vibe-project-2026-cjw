import { cardService } from '../services/card-service.js';

function createElement(tagName, className = '', text = '') {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createLink(label, href, className = '') {
  const link = createElement('a', className, label);
  link.href = href;
  return link;
}

function createButton(label, className = '') {
  const button = createElement('button', className, label);
  button.type = 'button';
  return button;
}

function createBreadcrumb(currentLabel) {
  const breadcrumb = createElement('nav', 'card-shop-breadcrumb');
  breadcrumb.setAttribute('aria-label', '현재 위치');
  breadcrumb.append(createLink('홈', '#/'));
  breadcrumb.append(createElement('span', '', '›'));
  breadcrumb.append(createLink('카드', '#/cards'));
  breadcrumb.append(createElement('span', '', '›'));
  breadcrumb.append(createElement('span', '', currentLabel));
  return breadcrumb;
}

function createCategoryNavigation() {
  const navigation = createElement('nav', 'card-category-navigation');
  navigation.setAttribute('aria-label', '카드 종류');
  ['전체카드', '신용카드', '체크카드', '플래티늄카드', 'GIFT카드', '기업카드', '현금카드']
    .forEach((label) => {
      const button = createButton(label, 'card-category-button');
      button.disabled = true;
      navigation.append(button);
    });

  const tabs = createElement('nav', 'card-recommendation-tabs');
  tabs.setAttribute('aria-label', '카드 추천 종류');
  const activeTab = createLink('추천카드', '#/cards', 'card-recommendation-tab is-active');
  activeTab.setAttribute('aria-current', 'page');
  tabs.append(activeTab);
  ['마일리지', '주유', '쇼핑', '외식', '교통', '캐시백'].forEach((label) => {
    const button = createButton(label, 'card-recommendation-tab');
    button.disabled = true;
    tabs.append(button);
  });
  return [navigation, tabs];
}

function createCardImage(product, className) {
  const image = createElement('img', className);
  image.src = product.image;
  image.alt = product.name;
  image.loading = 'lazy';
  return image;
}

function createPageHeading(title, description) {
  const heading = createElement('header', 'card-shop-heading');
  heading.append(createElement('h1', '', title));
  if (description) heading.append(createElement('p', '', description));
  return heading;
}

function createPageFrame(title, description, breadcrumbLabel) {
  const frame = createElement('div', 'card-shop-page');
  frame.append(createBreadcrumb(breadcrumbLabel));
  frame.append(createPageHeading(title, description));
  return frame;
}

function createProductCard(product) {
  const item = createElement('li', 'recommended-card-item');
  const link = createLink('', `#/card/${encodeURIComponent(product.id)}`, 'recommended-card-link');
  link.append(createElement('span', 'recommended-card-image', ''));
  link.firstElementChild.append(createCardImage(product, 'recommended-card-artwork'));
  const copy = createElement('span', 'recommended-card-copy');
  copy.append(createElement('strong', '', product.name));
  copy.append(createElement('span', 'recommended-card-fee', `연회비 ${product.annualFee}`));
  copy.append(createElement('span', 'recommended-card-description', product.description));
  link.append(copy, createElement('span', 'recommended-card-arrow', '상세 보기 ›'));
  item.append(link);
  return item;
}

function renderCatalog(container, products) {
  const page = createPageFrame(
    '추천카드',
    '카드 기본 정보를 확인하고 원하는 카드의 상세 정보를 살펴보세요.',
    '추천카드',
  );
  const [categoryNavigation, recommendationTabs] = createCategoryNavigation();
  const productList = createElement('ul', 'recommended-card-list');
  products.forEach((product) => productList.append(createProductCard(product)));
  const sampleNotice = createElement('p', 'card-sample-notice', '표시된 상품과 연회비는 화면 확인을 위한 샘플 정보입니다.');
  page.append(categoryNavigation, recommendationTabs, productList, sampleNotice);
  container.replaceChildren(page);
}

function renderProductDetail(container, product) {
  const page = createPageFrame('신용카드', '', '상세정보');
  const panel = createElement('article', 'card-product-detail');
  const header = createElement('header', 'card-product-detail-heading');
  header.append(createElement('h2', '', product.name));
  const description = createElement('p', 'card-product-description', product.description);
  const content = createElement('div', 'card-product-detail-content');
  const artwork = createElement('div', 'card-product-detail-artwork');
  artwork.append(createCardImage(product, 'card-product-image'));
  const information = createElement('dl', 'card-product-information');
  information.append(createElement('dt', '', '카드명'));
  information.append(createElement('dd', '', product.name));
  information.append(createElement('dt', '', '연회비'));
  information.append(createElement('dd', '', product.annualFee));
  content.append(artwork, information);
  const note = createElement('p', 'card-sample-notice', '표시된 상품과 연회비는 화면 확인을 위한 샘플 정보입니다.');
  const actions = createElement('div', 'card-product-actions');
  actions.append(createLink('추천카드 목록', '#/cards', 'card-shop-button'));
  const addButton = createButton('장바구니 담기', 'card-shop-button card-shop-button--primary');
  addButton.dataset.addCard = product.id;
  actions.append(addButton);
  panel.append(header, description, content, note, actions);
  page.append(panel);
  container.replaceChildren(page);
}

function createCartItem(product) {
  const item = createElement('li', 'cart-card-item');
  const details = createLink('', `#/card/${encodeURIComponent(product.id)}`, 'cart-card-details');
  const artwork = createElement('span', 'cart-card-image');
  artwork.append(createCardImage(product, 'cart-card-artwork'));
  const copy = createElement('span', 'cart-card-copy');
  copy.append(createElement('strong', '', product.name));
  copy.append(createElement('span', 'cart-card-fee', `연회비 ${product.annualFee}`));
  details.append(artwork, copy);
  const remove = createButton('삭제', 'card-shop-button');
  remove.dataset.removeCard = product.id;
  remove.setAttribute('aria-label', `${product.name} 장바구니에서 삭제`);
  item.append(details, remove);
  return item;
}

function renderCart(container, products) {
  const page = createPageFrame('장바구니', '담아둔 카드 상품을 확인할 수 있습니다.', '장바구니');
  if (!products.length) {
    const empty = createElement('p', 'card-cart-empty', '선택한 카드가 없습니다');
    page.append(empty, createLink('추천카드 보러가기', '#/cards', 'card-shop-button card-shop-button--primary'));
    container.replaceChildren(page);
    return;
  }

  const list = createElement('ul', 'cart-card-list');
  products.forEach((product) => list.append(createCartItem(product)));
  const total = createElement('p', 'cart-card-total', `장바구니 ${products.length}개`);
  page.append(total, list, createLink('추천카드 계속 보기', '#/cards', 'card-shop-button'));
  container.replaceChildren(page);
}

function renderError(container, error, retry) {
  const message = error instanceof Error ? error.message : '카드 정보를 불러오지 못했습니다.';
  const panel = createElement('div', 'card-shop-error');
  panel.append(createElement('p', '', message));
  const button = createButton('다시 시도', 'card-shop-button');
  button.addEventListener('click', retry, { once: true });
  panel.append(button);
  container.replaceChildren(panel);
}

function notifyCartUpdated() {
  window.dispatchEvent(new Event('cart-updated'));
}

export function initCardShop() {
  const view = document.querySelector('[data-card-shop-view]');
  const content = view?.querySelector('[data-card-shop-content]');
  if (!view || !content) return;
  let renderSequence = 0;

  async function renderRoute() {
    const segments = location.hash.slice(1).split('?')[0].split('/').filter(Boolean);
    const [section, id] = segments;
    const isCardRoute = ['cards', 'card', 'cart'].includes(section);
    view.hidden = !isCardRoute;
    if (!isCardRoute) return;

    const sequence = ++renderSequence;
    content.replaceChildren(createElement('p', 'notice-loading', '카드 정보를 불러오는 중입니다.'));
    try {
      if (section === 'cards') {
        const products = await cardService.getAllProducts();
        if (sequence === renderSequence) renderCatalog(content, products);
      } else if (section === 'card') {
        const product = await cardService.getProductById(decodeURIComponent(id ?? ''));
        if (sequence !== renderSequence) return;
        if (!product) {
          renderError(content, new Error('요청하신 카드 상품을 찾을 수 없습니다.'), renderRoute);
          return;
        }
        renderProductDetail(content, product);
      } else {
        const products = await cardService.getCart();
        if (sequence === renderSequence) renderCart(content, products);
      }
    } catch (error) {
      if (sequence === renderSequence) renderError(content, error, renderRoute);
    }
  }

  content.addEventListener('click', async (event) => {
    const addButton = event.target.closest('[data-add-card]');
    if (addButton) {
      addButton.disabled = true;
      try {
        const wasAdded = await cardService.addToCart(addButton.dataset.addCard);
        addButton.textContent = wasAdded ? '장바구니에 담겼습니다' : '이미 장바구니에 담긴 카드입니다';
        notifyCartUpdated();
      } catch (error) {
        addButton.disabled = false;
        renderError(content, error, renderRoute);
      }
      return;
    }

    const removeButton = event.target.closest('[data-remove-card]');
    if (!removeButton) return;
    removeButton.disabled = true;
    try {
      await cardService.removeFromCart(removeButton.dataset.removeCard);
      notifyCartUpdated();
      await renderRoute();
    } catch (error) {
      renderError(content, error, renderRoute);
    }
  });

  window.addEventListener('hashchange', renderRoute);
  renderRoute();

  async function renderHomeRecommendation() {
    const recommendation = document.querySelector('[data-card-recommendation]');
    if (!recommendation) return;
    try {
      const products = await cardService.getAllProducts();
      const product = products[0];
      if (!product) return;
      const link = recommendation.querySelector('[data-card-feature-link]');
      const image = recommendation.querySelector('[data-card-feature-image]');
      const name = recommendation.querySelector('[data-card-feature-name]');
      const fee = recommendation.querySelector('[data-card-feature-fee]');
      link.href = `#/card/${encodeURIComponent(product.id)}`;
      image.src = product.image;
      image.alt = product.name;
      name.textContent = product.name;
      fee.textContent = `연회비 ${product.annualFee}`;
    } catch (error) {
      recommendation.querySelector('[data-card-feature-fee]').textContent = error.message;
    }
  }

  renderHomeRecommendation();
}

