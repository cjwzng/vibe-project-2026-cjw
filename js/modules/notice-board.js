import { noticeService } from '../services/notice-service.js';

const PAGE_SIZE = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'pdf']);
const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'H2', 'H3', 'BLOCKQUOTE']);

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

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value)).replaceAll('. ', '.').replace(/\.$/, '');
}

function getRoute() {
  const [path, query = ''] = location.hash.slice(1).split('?');
  const segments = path.split('/').filter(Boolean);
  return {
    segments,
    params: new URLSearchParams(query),
  };
}

function buildListRoute(params) {
  const query = params.toString();
  return `#/notice${query ? `?${query}` : ''}`;
}

function createPagination(totalPages, currentPage, params) {
  const pagination = createElement('nav', 'notice-pagination');
  pagination.setAttribute('aria-label', '공지사항 페이지');
  const controls = [
    { label: '처음', page: 1, disabled: currentPage === 1 },
    { label: '이전', page: currentPage - 1, disabled: currentPage === 1 },
  ];

  controls.forEach(({ label, page, disabled }) => {
    const button = createElement('button', 'notice-page-control', label);
    button.type = 'button';
    button.disabled = disabled;
    button.dataset.page = String(page);
    pagination.append(button);
  });

  const firstPage = Math.max(1, Math.min(currentPage - 4, totalPages - 9));
  const lastPage = Math.min(totalPages, firstPage + 9);
  for (let page = firstPage; page <= lastPage; page += 1) {
    if (page === currentPage) {
      const current = createElement('span', 'notice-page-number is-current', String(page));
      current.setAttribute('aria-current', 'page');
      pagination.append(current);
      continue;
    }

    const button = createElement('button', 'notice-page-number', String(page));
    button.type = 'button';
    button.dataset.page = String(page);
    pagination.append(button);
  }

  [
    { label: '다음', page: currentPage + 1, disabled: currentPage === totalPages },
    { label: '끝', page: totalPages, disabled: currentPage === totalPages },
  ].forEach(({ label, page, disabled }) => {
    const button = createElement('button', 'notice-page-control', label);
    button.type = 'button';
    button.disabled = disabled;
    button.dataset.page = String(page);
    pagination.append(button);
  });

  pagination.dataset.route = buildListRoute(params);
  return pagination;
}

function createNoticeRow(notice) {
  const row = createElement('tr');
  const numberCell = createElement('td', 'notice-number', notice.no.toLocaleString('ko-KR'));
  const titleCell = createElement('td', 'notice-title-cell');
  const titleContent = createElement('div', 'notice-row-title');
  if (notice.isNotice) titleContent.append(createElement('span', 'notice-badge', '공지'));
  titleContent.append(createLink(notice.title, `#/notice/${encodeURIComponent(notice.id)}`, 'notice-row-link'));
  titleCell.append(titleContent);
  const dateCell = createElement('td', 'notice-date', formatDate(notice.createdAt));
  const viewCell = createElement('td', 'notice-views', notice.viewCount.toLocaleString('ko-KR'));
  row.append(numberCell, titleCell, dateCell, viewCell);
  return row;
}

function createSearchForm(params) {
  const form = createElement('form', 'notice-search-form');
  form.dataset.noticeSearch = '';
  const field = createElement('select', 'notice-search-field');
  field.name = 'field';
  field.setAttribute('aria-label', '검색 범위');
  [
    ['all', '전체'],
    ['title', '제목'],
  ].forEach(([value, label]) => {
    const option = createElement('option', '', label);
    option.value = value;
    field.append(option);
  });
  field.value = params.get('field') ?? 'all';

  const input = createElement('input', 'notice-search-input');
  input.type = 'search';
  input.name = 'keyword';
  input.placeholder = '제목을 입력해주세요.';
  input.setAttribute('aria-label', '검색어');
  input.value = params.get('keyword') ?? '';

  const submit = createElement('button', 'notice-button notice-button--primary', '검색');
  submit.type = 'submit';
  form.append(field, input, submit);
  return form;
}

function renderList(view, notices, route) {
  const params = route.params;
  const keyword = (params.get('keyword') ?? '').trim().toLocaleLowerCase();
  const field = params.get('field') ?? 'all';
  const filteredNotices = notices
    .filter((notice) => {
      if (!keyword) return true;
      const searchableText = field === 'title' ? notice.title : `${notice.title} ${notice.content}`;
      return searchableText.toLocaleLowerCase().includes(keyword);
    })
    .sort((left, right) => right.no - left.no);
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(requestedPage, totalPages))
    : 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentNotices = filteredNotices.slice(startIndex, startIndex + PAGE_SIZE);
  const panel = createElement('section', 'notice-panel notice-list-panel');
  const top = createElement('div', 'notice-list-top');
  const count = createElement('p', 'notice-total');
  count.append(createElement('span', 'notice-count-mark', '▮'));
  count.append(document.createTextNode(` 총 ${filteredNotices.length.toLocaleString('ko-KR')}건의 게시물이 있습니다.`));
  top.append(count, createLink('✎ 글쓰기', '#/notice/new', 'notice-button notice-button--primary'));

  const tableWrap = createElement('div', 'notice-table-wrap');
  const table = createElement('table', 'notice-table');
  const caption = createElement('caption', 'visually-hidden', '공지사항 목록');
  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['번호', '제목', '등록일', '조회수'].forEach((label) => {
    headerRow.append(createElement('th', '', label));
  });
  head.append(headerRow);
  const body = document.createElement('tbody');
  if (currentNotices.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = createElement('td', 'notice-empty', keyword ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.');
    emptyCell.colSpan = 4;
    emptyRow.append(emptyCell);
    body.append(emptyRow);
  } else {
    currentNotices.forEach((notice) => body.append(createNoticeRow(notice)));
  }
  table.append(caption, head, body);
  tableWrap.append(table);

  const paginationParams = new URLSearchParams(params);
  paginationParams.set('page', String(currentPage));
  const footer = createElement('div', 'notice-list-footer');
  footer.append(createPagination(totalPages, currentPage, paginationParams), createSearchForm(params));
  panel.append(top, tableWrap, footer);
  view.replaceChildren(panel);
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();

  const fragment = document.createDocumentFragment();
  const source = node;
  if (!ALLOWED_TAGS.has(source.tagName)) {
    [...source.childNodes].forEach((child) => fragment.append(sanitizeNode(child)));
    return fragment;
  }

  const element = document.createElement(source.tagName.toLocaleLowerCase());
  if (source.tagName === 'A') {
    const href = source.getAttribute('href') ?? '';
    try {
      const url = new URL(href, location.origin);
      if (['https:', 'http:', 'mailto:'].includes(url.protocol)) element.href = url.href;
    } catch {
      element.removeAttribute('href');
    }
  }
  [...source.childNodes].forEach((child) => element.append(sanitizeNode(child)));
  fragment.append(element);
  return fragment;
}

function sanitizeContent(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const safeContent = createElement('div');
  [...parsed.body.childNodes].forEach((node) => safeContent.append(sanitizeNode(node)));
  return safeContent.innerHTML;
}

function appendContent(target, html) {
  const parsed = new DOMParser().parseFromString(sanitizeContent(html), 'text/html');
  target.append(...parsed.body.childNodes);
}

function renderAttachments(container, attachments) {
  container.replaceChildren();
  if (!attachments.length) {
    container.append(createElement('p', 'notice-no-attachments', '첨부파일이 없습니다.'));
    return;
  }

  const list = createElement('ul', 'notice-attachment-list');
  attachments.forEach((attachment) => {
    const item = createElement('li');
    item.append(createElement('span', '', attachment.name));
    item.append(createElement('span', 'notice-attachment-size', `${(attachment.size / 1024).toFixed(0)} KB`));
    list.append(item);
  });
  container.append(list);
}

function renderDetail(view, notice) {
  const panel = createElement('article', 'notice-panel notice-detail-panel');
  const heading = createElement('header', 'notice-detail-heading');
  const titleBlock = createElement('div', 'notice-detail-title-block');
  if (notice.isNotice) titleBlock.append(createElement('span', 'notice-badge', '공지'));
  titleBlock.append(createElement('h2', 'notice-detail-title', notice.title));

  const metadata = createElement('div', 'notice-detail-metadata');
  metadata.append(createElement('time', '', formatDate(notice.createdAt)));
  metadata.lastElementChild.dateTime = notice.createdAt;
  metadata.append(createElement('span', '', `◉ ${notice.viewCount.toLocaleString('ko-KR')}`));
  heading.append(titleBlock, metadata);

  const body = createElement('div', 'notice-detail-body');
  appendContent(body, notice.content);
  const attachments = createElement('div', 'notice-detail-attachments');
  renderAttachments(attachments, notice.attachments);
  const actions = createElement('div', 'notice-detail-actions');
  actions.append(createLink('목록으로', '#/notice', 'notice-button'));
  const actionGroup = createElement('div', 'notice-action-group');
  const modify = createLink('✎ 수정', `#/notice/${encodeURIComponent(notice.id)}/edit`, 'notice-button');
  actionGroup.append(modify);
  const remove = createElement('button', 'notice-button', '▤ 삭제');
  remove.type = 'button';
  remove.dataset.deleteId = notice.id;
  actionGroup.append(remove);
  actions.append(actionGroup);
  panel.append(heading, body, attachments, actions);
  view.replaceChildren(panel);
}

function createEditorToolbar() {
  const toolbar = createElement('div', 'notice-editor-toolbar');
  const format = createElement('select', 'notice-editor-format');
  format.setAttribute('aria-label', '문단 형식');
  [
    ['P', '문단'],
    ['H2', '제목'],
    ['H3', '소제목'],
  ].forEach(([value, label]) => {
    const option = createElement('option', '', label);
    option.value = value;
    format.append(option);
  });
  format.dataset.format = '';
  toolbar.append(format);

  [
    ['bold', '굵게', 'B'],
    ['italic', '기울임', 'I'],
    ['underline', '밑줄', 'U'],
    ['insertUnorderedList', '글머리 기호 목록', '≡'],
    ['insertOrderedList', '번호 목록', '1.'],
  ].forEach(([command, label, text]) => {
    const button = createElement('button', 'notice-editor-tool', text);
    button.type = 'button';
    button.dataset.command = command;
    button.setAttribute('aria-label', label);
    button.title = label;
    toolbar.append(button);
  });
  return toolbar;
}

function formatFileSize(size) {
  return `${(size / 1024).toFixed(0)} KB`;
}

function renderFormAttachments(container, attachments) {
  container.replaceChildren();
  attachments.forEach((attachment, index) => {
    const item = createElement('li', 'notice-selected-file');
    item.append(createElement('span', '', `${attachment.name} (${formatFileSize(attachment.size)})`));
    const remove = createElement('button', 'notice-file-remove', '삭제');
    remove.type = 'button';
    remove.dataset.removeAttachment = String(index);
    remove.setAttribute('aria-label', `${attachment.name} 첨부 제거`);
    item.append(remove);
    container.append(item);
  });
}

function renderForm(view, notice = null) {
  let attachments = notice ? [...notice.attachments] : [];
  const isEditing = Boolean(notice);
  const panel = createElement('section', 'notice-panel notice-form-panel');
  const formHeading = createElement('h2', 'notice-form-heading', isEditing ? '글 수정' : '글쓰기');
  const form = createElement('form', 'notice-form');
  form.dataset.noticeForm = notice?.id ?? 'new';

  const titleRow = createElement('div', 'notice-form-row');
  const titleLabel = createElement('label', 'notice-form-label', '제목');
  titleLabel.htmlFor = 'notice-title-input';
  titleLabel.append(createElement('span', 'notice-required', ' *'));
  const titleInput = createElement('input', 'notice-title-input');
  titleInput.id = 'notice-title-input';
  titleInput.name = 'title';
  titleInput.required = true;
  titleInput.maxLength = 200;
  titleInput.placeholder = '제목을 입력해주세요.';
  titleInput.value = notice?.title ?? '';
  titleRow.append(titleLabel, titleInput);

  const contentRow = createElement('div', 'notice-form-row notice-form-row--content');
  const contentLabel = createElement('label', 'notice-form-label', '내용');
  contentLabel.htmlFor = 'notice-content-editor';
  contentLabel.append(createElement('span', 'notice-required', ' *'));
  const editor = createElement('div', 'notice-editor');
  editor.append(createEditorToolbar());
  const editable = createElement('div', 'notice-editor-content');
  editable.id = 'notice-content-editor';
  editable.contentEditable = 'true';
  editable.setAttribute('role', 'textbox');
  editable.setAttribute('aria-multiline', 'true');
  editable.setAttribute('aria-label', '공지사항 내용');
  editable.setAttribute('aria-required', 'true');
  editable.dataset.placeholder = '내용을 입력해주세요.';
  if (notice) appendContent(editable, notice.content);
  editor.append(editable);
  contentRow.append(contentLabel, editor);

  const attachmentRow = createElement('div', 'notice-form-row notice-form-row--attachments');
  const attachmentLabel = createElement('span', 'notice-form-label', '첨부파일');
  attachmentLabel.id = 'notice-attachment-label';
  const attachmentControl = createElement('div', 'notice-file-control');
  const fileInput = createElement('input', 'notice-file-input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = '.jpg,.jpeg,.png,.pdf';
  fileInput.setAttribute('aria-labelledby', attachmentLabel.id);
  const fileHint = createElement('span', 'notice-file-hint', '선택된 파일이 없습니다.');
  const fileLimit = createElement('small', 'notice-file-limit', '(최대 10MB, JPG, PNG, PDF)');
  const fileList = createElement('ul', 'notice-selected-files');
  attachmentControl.append(fileInput, fileHint, fileLimit, fileList);
  attachmentRow.append(attachmentLabel, attachmentControl);

  const error = createElement('p', 'notice-form-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  const actions = createElement('div', 'notice-form-actions');
  actions.append(createLink('취소', isEditing ? `#/notice/${encodeURIComponent(notice.id)}` : '#/notice', 'notice-button'));
  const submit = createElement('button', 'notice-button notice-button--primary', isEditing ? '수정' : '등록');
  submit.type = 'submit';
  actions.append(submit);
  form.append(titleRow, contentRow, attachmentRow, error, actions);
  panel.append(formHeading, form);
  view.replaceChildren(panel);

  form.addEventListener('change', (event) => {
    if (event.target === fileInput) {
      const files = [...fileInput.files];
      const invalid = [];
      files.forEach((file) => {
        const extension = file.name.split('.').pop()?.toLocaleLowerCase() ?? '';
        const typeIsAllowed = !file.type || ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
        if (!ALLOWED_EXTENSIONS.has(extension) || file.size > MAX_FILE_SIZE || !typeIsAllowed) {
          invalid.push(file.name);
          return;
        }
        attachments.push({ name: file.name, size: file.size, type: file.type || extension });
      });
      fileHint.textContent = attachments.length
        ? `${attachments.length}개 파일이 선택되었습니다.`
        : '선택된 파일이 없습니다.';
      fileInput.value = '';
      renderFormAttachments(fileList, attachments);
      error.hidden = invalid.length === 0;
      if (invalid.length) error.textContent = `파일 형식 또는 용량을 확인해 주세요: ${invalid.join(', ')}`;
    }

    if (event.target.matches('[data-format]')) {
      document.execCommand('formatBlock', false, event.target.value);
    }
  });

  form.addEventListener('click', (event) => {
    const commandButton = event.target.closest('[data-command]');
    if (commandButton) {
      event.preventDefault();
      editable.focus();
      document.execCommand(commandButton.dataset.command, false);
      return;
    }
    const removeButton = event.target.closest('[data-remove-attachment]');
    if (!removeButton) return;
    attachments.splice(Number(removeButton.dataset.removeAttachment), 1);
    fileHint.textContent = attachments.length
      ? `${attachments.length}개 파일이 선택되었습니다.`
      : '선택된 파일이 없습니다.';
    renderFormAttachments(fileList, attachments);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const content = sanitizeContent(editable.innerHTML);
    const contentText = editable.textContent.trim();
    if (!title || !contentText) {
      error.textContent = '제목과 내용을 모두 입력해 주세요.';
      error.hidden = false;
      if (!title) titleInput.focus();
      else editable.focus();
      return;
    }
    error.hidden = true;
    submit.disabled = true;

    try {
      const data = { title, content, attachments };
      const savedNotice = isEditing
        ? await noticeService.update(notice.id, data)
        : await noticeService.create(data);
      window.dispatchEvent(new Event('notice-data-changed'));
      location.hash = `#/notice/${encodeURIComponent(savedNotice.id)}`;
    } catch (saveError) {
      error.textContent = saveError.message || '저장에 실패했습니다. 다시 시도해 주세요.';
      error.hidden = false;
      submit.disabled = false;
    }
  });
}

function renderError(view, message, retry) {
  const panel = createElement('section', 'notice-panel notice-error-panel');
  panel.append(createElement('p', '', message));
  const button = createElement('button', 'notice-button notice-button--primary', '다시 시도');
  button.type = 'button';
  button.addEventListener('click', retry, { once: true });
  panel.append(button);
  view.replaceChildren(panel);
}

export function initNoticeBoard() {
  const homeViews = [...document.querySelectorAll('[data-home-view]')];
  const noticeView = document.querySelector('[data-notice-view]');
  const content = noticeView?.querySelector('[data-notice-content]');
  if (!noticeView || !content) return;

  let renderSequence = 0;

  async function renderRoute() {
    const route = getRoute();
    const [section, id, action] = route.segments;
    const isNoticeRoute = section === 'notice';
    const isAppRoute = isNoticeRoute || ['cards', 'card', 'cart'].includes(section);
    homeViews.forEach((element) => {
      element.hidden = isAppRoute;
    });
    noticeView.hidden = !isNoticeRoute;
    if (!isNoticeRoute) return;

    const sequence = ++renderSequence;
    content.replaceChildren(createElement('p', 'notice-loading', '공지사항을 불러오는 중입니다.'));
    try {
      const notices = await noticeService.getAll();
      if (sequence !== renderSequence) return;
      if (!id) {
        renderList(content, notices, route);
        return;
      }
      if (id === 'new') {
        renderForm(content);
        return;
      }

      const notice = action === 'edit'
        ? await noticeService.getById(decodeURIComponent(id))
        : await noticeService.incrementViewCount(decodeURIComponent(id));
      if (sequence !== renderSequence) return;
      if (!notice) {
        renderError(content, '요청하신 공지사항을 찾을 수 없습니다.', () => {
          location.hash = '#/notice';
        });
        return;
      }
      if (action === 'edit') renderForm(content, notice);
      else renderDetail(content, notice);
    } catch (error) {
      if (sequence !== renderSequence) return;
      renderError(content, error.message || '공지사항을 불러오지 못했습니다.', renderRoute);
    }
  }

  document.addEventListener('click', async (event) => {
    const pageButton = event.target.closest('[data-page]');
    if (pageButton && !pageButton.disabled) {
      event.preventDefault();
      const params = new URLSearchParams(pageButton.closest('.notice-pagination')?.dataset.route.split('?')[1] ?? '');
      params.set('page', pageButton.dataset.page);
      location.hash = buildListRoute(params);
      return;
    }

    const deleteButton = event.target.closest('[data-delete-id]');
    if (!deleteButton) return;
    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;
    deleteButton.disabled = true;
    try {
      await noticeService.remove(deleteButton.dataset.deleteId);
      window.dispatchEvent(new Event('notice-data-changed'));
      location.hash = '#/notice';
    } catch (error) {
      deleteButton.disabled = false;
      renderError(content, error.message || '공지사항을 삭제하지 못했습니다.', renderRoute);
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-notice-search]');
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams();
    params.set('field', String(data.get('field') ?? 'all'));
    params.set('keyword', String(data.get('keyword') ?? '').trim());
    params.set('page', '1');
    location.hash = buildListRoute(params);
  });

  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
