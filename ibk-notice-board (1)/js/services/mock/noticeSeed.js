/**
 * 초기 확인용 시드 데이터.
 * - 목록 시안(총 127건)의 상위 7건을 그대로 재현하고,
 * - 페이지네이션 확인을 위해 나머지 120건은 샘플 게시물로 채운다.
 *   (필요 없으면 SEED_FILLER_COUNT 를 0 으로)
 *
 * 지침: id 는 crypto.randomUUID(), 날짜는 ISO 8601 문자열.
 */
import { newId } from "../../utils/id.js";
import { CURRENT_USER } from "../../config.js";

const SEED_FILLER_COUNT = 120;
const FIRST_POST_NO = 7558;

const p = (text) => `<p>${text}</p>`;
const blank = "<p><br></p>";

const CHUSEOK_CONTENT = [
  p("안녕하십니까. IBK기업은행입니다."),
  p("추석 연휴 기간 동안 금융서비스 이용에 대해 아래와 같이 안내드립니다."),
  blank,
  p("1. 이용기간 : 2026년 10월 3일(토) ~ 10월 9일(금)"),
  p("2. 이용가능 서비스"),
  p("&nbsp;&nbsp;&nbsp;&nbsp;- 인터넷뱅킹, 모바일뱅킹, 자동화기기(일부 서비스 제외)"),
  p("3. 유의사항"),
  p("&nbsp;&nbsp;&nbsp;&nbsp;- 연휴 기간 중 일부 서비스는 제한될 수 있습니다."),
  blank,
  p("자세한 사항은 홈페이지 공지사항을 참고하시기 바랍니다."),
  p("감사합니다."),
].join("");

const HR_CONTENT = [
  p("안녕하십니까. IBK기업은행입니다."),
  p("2026년 하반기 정기인사를 아래와 같이 단행하였음을 안내드립니다."),
  blank,
  p("<b>1. 시행일 :</b> 2026년 10월 13일(화)"),
  p("<b>2. 주요 내용</b>"),
  "<ul><li>본부 부서장 및 영업점장 전보</li><li>승진 및 직무 전환 인사</li></ul>",
  blank,
  p(
    '인사 관련 상세 내용은 <a href="https://www.ibk.co.kr" target="_blank" rel="noopener noreferrer">IBK기업은행 홈페이지</a>에서 확인하실 수 있습니다.',
  ),
  p("감사합니다."),
].join("");

const generic = (title) =>
  [
    p("안녕하십니까. IBK기업은행입니다."),
    p(`${title} 관련 내용을 안내드립니다.`),
    blank,
    p("자세한 사항은 홈페이지 공지사항을 참고하시기 바랍니다."),
    p("감사합니다."),
  ].join("");

/** [제목, 등록일(ISO), 조회수, 유형, 중요공지] — 시안 상위 7건 */
const HEAD_ROWS = [
  ["IBK기업은행, 2026년 하반기 정기인사 단행 안내", "2026-10-13T03:00:00.000Z", 412, "general", true, HR_CONTENT],
  ["IBK기업은행, 추석 연휴 금융서비스 이용 안내", "2026-10-10T03:00:00.000Z", 687, "general", true, CHUSEOK_CONTENT],
  ["IBK기업은행, '소상공인 금융 부담 완화 위해 1조 5000억원 규모 금융지원 실시'", "2026-10-08T03:00:00.000Z", 298, "event", false],
  ["IBK기업은행, 'IBK혁신금융' 2차년도 성과 발표", "2026-10-06T03:00:00.000Z", 521, "etc", false],
  ["IBK기업은행, '기업 금융 마이데이터' 법인 수신업무 도입", "2026-10-04T03:00:00.000Z", 376, "general", false],
  ["IBK기업은행, 2027년 상반기 IBK장학생 선발 모집", "2026-10-02T03:00:00.000Z", 448, "event", false],
  ["IBK기업은행, 베트남 현지법인 'IBK베트남은행' 공식 출범", "2026-09-30T03:00:00.000Z", 603, "general", false],
];

const CATEGORY_CYCLE = ["general", "general", "event", "system", "general", "etc"];

/** @returns {import('../../types/notice.js').Notice[]} */
export function buildSeedNotices() {
  const headNotices = HEAD_ROWS.map(([title, createdAt, viewCount, category, isImportant, content], i) => ({
    id: newId(),
    postNo: FIRST_POST_NO - i,
    title,
    content: content ?? generic(title),
    category,
    isImportant,
    author: { ...CURRENT_USER },
    attachments: [],
    viewCount,
    createdAt,
    updatedAt: createdAt,
  }));

  const baseTime = new Date("2026-09-29T03:00:00.000Z").getTime();
  const fillers = Array.from({ length: SEED_FILLER_COUNT }, (_, i) => {
    const postNo = FIRST_POST_NO - HEAD_ROWS.length - i;
    const createdAt = new Date(baseTime - i * 2 * 24 * 60 * 60 * 1000).toISOString();
    const title = `[샘플] IBK기업은행 공지사항 안내 (${postNo.toLocaleString("ko-KR")}호)`;
    return {
      id: newId(),
      postNo,
      title,
      content: generic(title),
      category: CATEGORY_CYCLE[i % CATEGORY_CYCLE.length],
      isImportant: false,
      author: { ...CURRENT_USER },
      attachments: [],
      viewCount: 100 + ((i * 37) % 400),
      createdAt,
      updatedAt: createdAt,
    };
  });

  return [...headNotices, ...fillers];
}
