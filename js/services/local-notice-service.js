import { getStoredValue, setStoredValue } from './storage-helper.js';

const STORAGE_KEY = 'notices';
const seedNotices = [
  {
    id: '1c1f2780-69ac-4aeb-ae70-126101e57558',
    no: 7558,
    title: 'IBK기업은행, 2026년 하반기 정기인사 단행 안내',
    content: 'IBK기업은행의 2026년 하반기 정기인사 내용을 안내드립니다.',
    isNotice: true,
    attachments: [],
    createdAt: '2026-10-13T00:00:00.000+09:00',
    viewCount: 412,
    updatedAt: '2026-10-13T00:00:00.000+09:00',
  },
  {
    id: '3c8e8f20-7cc2-4c0a-a719-202610107557',
    no: 7557,
    title: 'IBK기업은행, 추석 연휴 금융서비스 이용 안내',
    content: [
      '안녕하십니까. IBK기업은행입니다.',
      '추석 연휴 기간 동안 금융서비스 이용에 대해 아래와 같이 안내드립니다.',
      '',
      '1. 이용기간 : 2026년 10월 3일(토) ~ 10월 9일(금)',
      '2. 이용가능 서비스',
      '   - 인터넷뱅킹, 모바일뱅킹, 자동화기기(일부 서비스 제외)',
      '3. 유의사항',
      '   - 연휴 기간 중 일부 서비스는 제한될 수 있습니다.',
      '',
      '자세한 사항은 홈페이지 공지사항을 참고하시기 바랍니다.',
      '감사합니다.',
    ].join('\n'),
    isNotice: true,
    attachments: [],
    createdAt: '2026-10-10T00:00:00.000+09:00',
    viewCount: 687,
    updatedAt: '2026-10-10T00:00:00.000+09:00',
  },
  {
    id: 'af31d85b-b4f3-48ae-bab0-202610087556',
    no: 7556,
    title: 'IBK기업은행, ‘소상공인 금융 부담 완화 위해 1조 5000억원 규모 금융지원 실시’',
    content: '소상공인의 금융 부담 완화를 위한 금융지원 내용을 안내드립니다.',
    isNotice: false,
    attachments: [],
    createdAt: '2026-10-08T00:00:00.000+09:00',
    viewCount: 298,
    updatedAt: '2026-10-08T00:00:00.000+09:00',
  },
  {
    id: 'fc23ab41-8d0f-41c1-9181-202610067555',
    no: 7555,
    title: 'IBK기업은행, ‘IBK혁신금융’ 2차년도 성과 발표',
    content: 'IBK혁신금융 2차년도 주요 성과를 안내드립니다.',
    isNotice: false,
    attachments: [],
    createdAt: '2026-10-06T00:00:00.000+09:00',
    viewCount: 521,
    updatedAt: '2026-10-06T00:00:00.000+09:00',
  },
  {
    id: 'ca73d991-7ca3-4479-a233-202610047554',
    no: 7554,
    title: 'IBK기업은행, 기업 금융 마이데이터 법인 수신업무 도입',
    content: '기업 금융 마이데이터 법인 수신업무 도입 소식을 안내드립니다.',
    isNotice: false,
    attachments: [],
    createdAt: '2026-10-04T00:00:00.000+09:00',
    viewCount: 376,
    updatedAt: '2026-10-04T00:00:00.000+09:00',
  },
  {
    id: 'a6323402-4210-42bf-8723-202610027553',
    no: 7553,
    title: 'IBK기업은행, 2027년 상반기 IBK창공센터 선발 공고',
    content: '2027년 상반기 IBK창공센터 선발 일정을 안내드립니다.',
    isNotice: false,
    attachments: [],
    createdAt: '2026-10-02T00:00:00.000+09:00',
    viewCount: 448,
    updatedAt: '2026-10-02T00:00:00.000+09:00',
  },
  {
    id: '7394a202-0930-44c1-a820-202609307552',
    no: 7552,
    title: 'IBK기업은행, 베트남 현지법인 ‘IBK베트남은행’ 공식 출범',
    content: 'IBK기업은행 베트남 현지법인 공식 출범 소식을 안내드립니다.',
    isNotice: false,
    attachments: [],
    createdAt: '2026-09-30T00:00:00.000+09:00',
    viewCount: 603,
    updatedAt: '2026-09-30T00:00:00.000+09:00',
  },
];

async function getNotices() {
  const notices = await getStoredValue(STORAGE_KEY, null);
  if (notices !== null) return notices;

  await setStoredValue(STORAGE_KEY, seedNotices);
  return seedNotices;
}

function createId() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('이 브라우저에서는 안전한 게시물 ID를 만들 수 없습니다.');
  }
  return crypto.randomUUID();
}

export const localNoticeService = {
  async getAll() {
    return getNotices();
  },

  async getById(id) {
    const notices = await getNotices();
    return notices.find((notice) => notice.id === id) ?? null;
  },

  async create(data) {
    const notices = await getNotices();
    const now = new Date().toISOString();
    const nextNo = Math.max(0, ...notices.map((notice) => notice.no)) + 1;
    const notice = {
      ...data,
      id: createId(),
      no: nextNo,
      isNotice: false,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
    };

    await setStoredValue(STORAGE_KEY, [notice, ...notices]);
    return notice;
  },

  async update(id, data) {
    const notices = await getNotices();
    const index = notices.findIndex((notice) => notice.id === id);
    if (index < 0) throw new Error('수정할 공지사항을 찾을 수 없습니다.');

    const updatedNotice = {
      ...notices[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    notices[index] = updatedNotice;
    await setStoredValue(STORAGE_KEY, notices);
    return updatedNotice;
  },

  async remove(id) {
    const notices = await getNotices();
    const filteredNotices = notices.filter((notice) => notice.id !== id);
    if (filteredNotices.length === notices.length) {
      throw new Error('삭제할 공지사항을 찾을 수 없습니다.');
    }
    await setStoredValue(STORAGE_KEY, filteredNotices);
  },

  async incrementViewCount(id) {
    const notices = await getNotices();
    const notice = notices.find((item) => item.id === id);
    if (!notice) throw new Error('공지사항을 찾을 수 없습니다.');

    notice.viewCount += 1;
    await setStoredValue(STORAGE_KEY, notices);
    return notice;
  },
};
