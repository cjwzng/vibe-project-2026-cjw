# AGENTS.md — 웹 프로젝트 디자인·개발 규약

> **대상**: 이 프로젝트에서 코드를 작성·수정하는 모든 AI 에이전트
> **스택**: HTML5 / CSS3 / Vanilla JavaScript (ES2022+) — 프레임워크·빌드 도구 없음
> **타겟 사이트**: https://www.ibk.co.kr/ — 시각 디자인은 동일, 내부 레이아웃은 **PART 3의 단순화 구조**로 구현
> **페르소나**: Designer = 15년차 시니어 웹디자이너 / Developer = 15년차 시니어 웹개발자
> **효력**: 이 문서의 `MUST` / `MUST NOT`은 예외 없이 지킨다. `SHOULD`는 합당한 이유를 주석이나 PR 설명에 남기면 벗어날 수 있다.

---

## 0. 공통 원칙 (Designer·Developer 공통)

### 0.1 작업 순서

1. **읽기** — 작업 전 `/css/tokens.css`, 기존 컴포넌트, 이 문서(특히 **PART 3 사이트 전용 규칙**)를 먼저 읽는다.
2. **재사용 우선** — 이미 있는 토큰·컴포넌트·유틸리티를 쓴다. 비슷한 것을 새로 만들지 않는다.
3. **최소 변경** — 요청받은 범위만 수정한다. 관련 없는 파일을 "정리"하지 않는다.
4. **자체 검수** — 완료 전 문서 끝의 **체크리스트(PART 4)** 를 통과시킨다.
5. **불확실하면 질문** — 브랜드·문구·동작이 명세에 없으면 임의로 정하지 말고 가정을 명시하거나 질문한다.

### 0.2 우선순위 (충돌 시)

```
접근성·보안  >  사용자 요구 명세  >  이 문서  >  성능  >  개인 취향·관습
```

### 0.3 프로젝트 구조 (MUST)

```
/
├─ index.html
├─ pages/                  # 하위 페이지 (kebab-case.html)
├─ assets/
│  ├─ images/              # webp/avif 우선, 원본은 /assets/src/
│  ├─ icons/               # SVG only
│  └─ fonts/               # woff2 only
├─ css/
│  ├─ tokens.css           # 디자인 토큰 (색·타입·간격·그림자·모션)
│  ├─ base.css             # reset + 요소 기본 스타일
│  ├─ layout.css           # 겉박스·.inner-box·파티션 (PART 3)
│  ├─ components/          # 컴포넌트별 1파일 (button.css, card.css …)
│  ├─ utilities.css        # 최소한의 유틸리티 (.visually-hidden 등)
│  └─ main.css             # @import 순서만 관리 (또는 link 순서)
└─ js/
   ├─ main.js              # 진입점 (type="module")
   ├─ modules/             # 기능 단위 모듈 (nav.js, modal.js …)
   ├─ utils/               # 순수 함수 (dom.js, format.js …)
   └─ config.js            # 상수·셀렉터·설정
```

- 파일·폴더명은 **kebab-case**, 한글·공백·대문자 금지.
- CSS 적용 순서는 **tokens → base → layout → components → utilities**.

### 0.4 금지 사항 (공통)

- 요청하지 않은 라이브러리·CDN·폰트 추가 금지 (필요 시 이유와 함께 먼저 제안).
- `TODO`, `lorem ipsum`, `asdf`, `test123` 등 임시 값을 완성 산출물에 남기지 않는다.
- 생성된 코드에 "AI가 만들었다"는 설명 주석(`// This function does…` 식 서술형 주석) 남발 금지. 주석은 **왜**를 설명할 때만.
- 콘솔 로그(`console.log`) 남긴 채 완료 금지.

---

# PART 1. DESIGNER 규약

> **15년차 웹디자이너의 기준**: 장식이 아니라 **정보 위계·일관성·접근성·실제 구현 가능성**으로 판단한다. "예쁜가?"보다 "이유가 있는가?"를 먼저 묻는다.

## 1. 디자인 시작 전 (MUST)

1. **주제·대상·핵심 행동(Primary Job)** 을 한 문장씩 정의한다. 브리프에 없으면 가정을 명시하고 확인받는다.
2. 아래 **디자인 계획**을 먼저 작성한 뒤 코딩한다.
   - **Color** — 4~6개의 이름 붙은 기본 팔레트(hex)
   - **Type** — 서체와 역할
   - **Layout** — 한 문장 컨셉 + ASCII 와이어프레임, 정렬 기준(좌측/중앙/양쪽)
   - **Principles** — 이 사이트를 다른 사이트와 구분 짓는 핵심 원칙 1~3개
3. 계획을 **"어떤 비슷한 사이트에도 쓸 수 있는 기본값인가?"** 로 자체 검토하고, 그렇다면 수정한 뒤 이유를 한 줄로 남긴다.
4. **한 곳에만 대담해진다.** 기억에 남는 요소는 하나로 하고, 나머지는 조용하고 절제한다.

## 2. 디자인 토큰 (MUST)

모든 시각 값은 `/css/tokens.css`의 CSS 변수로만 정의하고, 컴포넌트에서는 **변수만 참조**한다. 하드코딩 값(`#333`, `13px`, `margin: 17px`) 금지.

### 2.1 색상

| 구분 | 토큰 예시 | 규칙 |
|---|---|---|
| 브랜드 | `--color-primary`, `--color-primary-hover`, `--color-primary-active` | 주조색 1 + 보조 최대 1 |
| 중립 | `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted` | 중립 스케일 9단계 이내 |
| 상태 | `--color-success/warning/danger/info` | 아이콘·텍스트와 함께 사용 (색만으로 전달 금지) |

- **역할 기반 네이밍**(`--color-text`)을 쓰고, 값 기반 네이밍(`--color-blue-500`)은 팔레트 원천에만 사용.
- 색 비율 **60(배경) : 30(보조/표면) : 10(강조)** 를 기본으로 한다.
- **대비비(WCAG 2.2 AA)**: 본문 텍스트 ≥ **4.5:1**, 큰 텍스트(24px↑ 또는 18.66px↑ bold)와 UI 컴포넌트 경계 ≥ **3:1**.
- 순수 `#000` / `#fff` 남용 금지. 미세하게 틴트된 중립을 사용.
- 다크 모드를 지원한다면 `:root`에 라이트, `@media (prefers-color-scheme: dark)`와 `[data-theme="dark"]`에 재정의. 토큰 이름은 동일하게 유지.

### 2.2 타이포그래피

- 서체는 **최대 2종**(제목/본문). 2종이면 성격이 분명히 달라야 한다. 시스템 기본 서체를 습관적으로 선택하지 않는다.
- **한글 본문 기본**: `Pretendard` 등 한글 지원 가변 폰트 + 시스템 폴백. 폴백 스택을 반드시 지정.
  ```css
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
               "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  ```
- **타입 스케일**은 비율(1.200~1.333) 기준으로 토큰화한다. 임의 크기 금지.
  ```css
  --fs-xs: 0.75rem;   --fs-sm: 0.875rem;  --fs-md: 1rem;
  --fs-lg: 1.25rem;   --fs-xl: 1.5rem;    --fs-2xl: 2rem;   --fs-3xl: clamp(2.25rem, 1.5rem + 3vw, 3.5rem);
  ```
- 본문 **최소 16px(1rem)**, 모바일 입력창 16px 이상(iOS 자동 확대 방지).
- 행간: 한글 본문 **1.6~1.8**, 제목 **1.2~1.35**. 자간: 한글 본문 `-0.01em ~ 0`, 제목은 약간 좁게.
- 행 길이: 영문 **45~75자**, 한글 **25~40자 내외**. 본문 컨테이너 `max-width: 65ch` 수준 유지.
- `word-break: keep-all; overflow-wrap: anywhere;` 로 한글 단어 단위 줄바꿈.
- 폰트 굵기는 **3단계 이내**(400/500/700 등)로 위계를 만든다.
- 피해야 할 "생성형 티" 타이포: 제목에서 **한 단어만** 색/이탤릭으로 강조, 모든 라벨을 **대문자+자간 확대**, 모든 섹션 위에 불필요한 작은 라벨(eyebrow) 추가.

### 2.3 간격·레이아웃

- **8pt 그리드**: 간격 토큰은 `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`px만 사용.
  ```css
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem;
  ```
- **근접성 원칙**: 관련 요소는 가깝게, 무관한 요소는 멀게. 내부 간격 < 외부 간격.
- 컨테이너는 **`.inner-box` 하나로 일원화**한다: `max-width: var(--inner-max)` + 중앙정렬. 값·좌우 패딩은 PART 3 §3.3을 따르며, 일반 기준(1200/1440px)은 사용하지 않는다.
- 파티션은 **Flexbox 기준**이다. 12컬럼 `CSS Grid`는 쓰지 않는다 (PART 3 §3.2). 간격은 `gap` 토큰.
- 사이트 전용 박스 수치는 PART 3 토큰이 우선한다. 8pt 배수가 아니어도 사이트 값을 그대로 토큰화한다.
- 섹션 수직 리듬은 일정하게(예: 데스크톱 96~128px, 모바일 56~72px). 섹션마다 다른 값 금지.

### 2.4 형태·깊이

- `border-radius`는 토큰 3단계 이내(`--radius-sm/md/lg`). **요소 위계와 무관하게 전부 같은 라운드 + 같은 그림자 + 같은 카드 반복**하는 구성 금지.
- 그림자는 **고도(elevation) 3단계** 이내. 방향·색 일관(상단 광원 가정).
- 구분선·테두리·번호는 **정보를 전달할 때만** 사용. 순서가 없는 내용에 `01 / 02 / 03` 번호 금지.
- 장식용 그라디언트 워시, 의미 없는 블러 오브(blob)는 지양.

### 2.5 모션

- 모션 토큰: `--duration-fast: 120ms; --duration-base: 200ms; --duration-slow: 320ms;` / `--ease-standard: cubic-bezier(.2,0,0,1);`
- **사용자 행동에 반응하는 모션**(열림·닫힘·확정·피드백)을 우선한다.
- 사용자 행동과 무관한 모션은 **페이지당 1개의 연출**만. 모든 섹션에 페이드+슬라이드업, 모든 카드에 hover 변형을 넣는 습관 금지.
- `transform`, `opacity`만 애니메이션 (레이아웃 속성 `width/height/top/left` 애니메이션 금지).
- **`prefers-reduced-motion: reduce` 대응 필수**.

## 3. 컴포넌트 디자인 규칙

### 3.1 공통 상태 (모든 인터랙티브 요소 MUST)

`default · hover · focus-visible · active · disabled` + (해당 시) `loading · error · selected`

- **포커스 링은 반드시 보여야 한다.** `outline: none` 단독 사용 금지. 대체 시 동등한 시각 표시 제공.
  ```css
  :focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
  ```
- 터치 타깃 **최소 44×44px** (WCAG 2.2 AA 최소 24×24, 권장 44).
- hover만으로 정보·기능을 제공하지 않는다 (모바일 대체 수단 필수).

### 3.2 버튼

- 위계: **Primary(페이지당 1개 중심) → Secondary → Tertiary(텍스트)**.
- 라벨은 **행동을 정확히 설명하는 능동형**: "저장하기", "문의 보내기" (✕ "확인", "Submit").
- 같은 행동은 흐름 전체에서 같은 이름을 유지 ("발행" 버튼 → "발행되었습니다" 토스트).
- 로딩 중에는 중복 클릭 방지 + 상태 표시.

### 3.3 폼

- 라벨은 **항상 보이는 `<label>`** 사용 (placeholder를 라벨로 쓰지 않는다).
- 필수/선택 표시 일관, 오류 메시지는 **무엇이 잘못됐고 어떻게 고치는지** 설명. 사과·모호한 표현 금지.
  - ✕ "오류가 발생했습니다." → ✓ "이메일 형식이 올바르지 않습니다. 예: name@example.com"
- 오류는 필드 근처에 표시하고 `aria-describedby`로 연결, 색 + 아이콘 + 텍스트 병행.

### 3.4 내비게이션

- 1차 메뉴 **7개 이내**. 현재 위치를 시각 + `aria-current="page"`로 표시.
- 모바일 메뉴는 포커스 트랩·ESC 닫기·열림 상태 표시 포함.
- 로고는 홈 링크. 스킵 링크(`본문 바로가기`) 제공.

### 3.5 이미지·아이콘

- 아이콘은 **하나의 세트**에서만 (선 굵기·모서리·크기 그리드 통일). SVG, `currentColor` 사용.
- 의미 있는 이미지는 `alt` 필수, 장식 이미지는 `alt=""`.
- 이미지 위 텍스트는 대비 확보(오버레이 또는 배치 조정). 이미지에 텍스트를 구워 넣지 않는다.
- 종횡비를 고정(`aspect-ratio`)해 레이아웃 이동(CLS)을 방지.

## 4. 반응형 디자인 규칙

- **모바일 퍼스트**로 설계하고 `min-width` 미디어 쿼리로 확장.
- 브레이크포인트 토큰 (기기가 아닌 **콘텐츠가 깨지는 지점** 기준으로 보정 가능):

| 이름 | 값 | 비고 |
|---|---|---|
| `sm` | 480px | 큰 폰 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크톱 |
| `xl` | 1280px | 데스크톱 |
| `2xl` | 1536px | 와이드 |

- 필수 검수 뷰포트: **360 / 390 / 768 / 1024 / 1440px**. 가로 스크롤 발생 금지. 사이트 전환 경계(767·768, 959·960, 1200px)는 PART 3 §3.6을 따른다.
- 유동 타이포·간격은 `clamp()` 활용. 고정 px 레이아웃 금지.
- 가능한 곳에서는 미디어 쿼리 대신 **컨테이너 쿼리(`@container`)** 와 `flex-wrap`으로 해결. 파티션에 `auto-fit/minmax` 그리드는 쓰지 않는다.

## 5. 콘텐츠·카피 규칙

- 문구는 장식이 아니라 **사용 편의를 위한 설계 요소**. 사용자 관점에서 쉬운 말로 쓴다.
  - ✕ "웹훅 설정" → ✓ "알림 관리"
- 한국어 UI는 **해요체/합쇼체 중 하나로 통일**(브랜드 톤에 맞춰 사전 결정). 한 화면에서 혼용 금지.
- 문장 부호·숫자·날짜 형식 통일 (`2026.11.02` 또는 `2026-11-02` 중 하나).
- 빈 화면은 분위기가 아니라 **다음 행동을 안내**한다. 오류는 **원인 + 해결 방법**.
- 특정 브랜드·사람·제품명을 함부로 지어내지 않는다. 더미 콘텐츠는 주제에 맞는 현실적인 문구를 사용.

## 6. "범용 AI 디자인" 회피 (SHOULD → 위반 시 사유 기재)

다음은 주제와 무관하게 반복되는 기본값이므로 **브리프가 지시하지 않는 한** 선택하지 않는다.

- 크림 배경 + 고대비 세리프 + 테라코타 포인트
- 검정 배경 + 형광 단색 포인트
- 신문 스타일 헤어라인 + 직각 레이아웃
- 동일 카드 N개 + 동일 라운드 + 동일 그림자 + 그라디언트
- 모든 섹션 상단의 대문자 라벨, 중점(`·`)으로 이은 메타 문자열, `WORD — 설명` 라벨, 버튼 끝 `→`

> 브리프에 명시된 시각 방향이 있으면 **브리프가 항상 우선**한다.

---

# PART 2. DEVELOPER 규약

> **15년차 웹개발자의 기준**: 동작하는 코드가 아니라 **읽기 쉽고, 깨지지 않고, 바꾸기 쉬운** 코드를 쓴다. 단순함을 선택하고, 추상화는 반복이 증명된 뒤에만 한다.

## 1. HTML

### 1.1 문서 기본 (MUST)

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>페이지명 | 사이트명</title>
  <meta name="description" content="80~120자 내외의 페이지 요약">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="…">
  <meta property="og:description" content="…">
  <meta property="og:image" content="…">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/main.css">
  <script type="module" src="/js/main.js"></script>
</head>
```

- `<html lang>` 필수. 페이지마다 **고유한 `<title>`/`description`**.
- 스크립트는 `type="module"`(자동 defer) 또는 `defer`. 동기 스크립트로 렌더링 차단 금지.
- 인라인 `style`·`onclick` 등 **인라인 이벤트 핸들러 금지**.

### 1.2 시맨틱 (MUST)

- 랜드마크: `<header> <nav> <main> <aside> <footer>`. **`<main>`은 페이지당 1개**. 페이지 골격은 **`header + (main > section) + footer`** 로 고정 (PART 3 §3.1).
- 제목은 **`h1`은 페이지당 1개**, `h1→h2→h3` 순서를 건너뛰지 않는다. 제목 레벨은 크기가 아니라 **문서 구조**로 결정(크기는 CSS).
- 클릭 동작은 `<button>`, 이동은 `<a href>`. **`<div>`/`<span>`에 클릭 이벤트 부여 금지.**
- 목록은 `ul/ol/dl`, 표 데이터는 `table` (`caption`, `th scope`). 레이아웃에 `table` 금지.
- 폼 요소는 `label[for]` + `id`, 의미 있는 `type`/`autocomplete`/`inputmode` 지정.
- `<img>`에 `width`/`height`, `alt`, `loading="lazy"`(첫 화면 밖), `decoding="async"`. LCP 이미지는 `fetchpriority="high"`, lazy 금지.
- 반응형 이미지는 `srcset`/`sizes`/`<picture>` 사용.
- 외부 링크 `target="_blank"` 시 `rel="noopener noreferrer"` 필수.

### 1.3 접근성 (WCAG 2.2 AA, MUST)

- 키보드만으로 **모든 기능** 사용 가능, 탭 순서는 시각 순서와 일치. `tabindex`는 `0`/`-1`만 (양수 금지).
- ARIA는 **시맨틱 HTML로 불가능할 때만**. "ARIA 없음이 잘못된 ARIA보다 낫다."
- 동적 변경은 `aria-live`/포커스 이동으로 알림. 모달은 `<dialog>` 우선, 포커스 트랩·ESC·복귀 포커스.
- 스킵 링크, `aria-current`, `aria-expanded`, `aria-controls` 정확히 갱신.
- 시각적 숨김은 `.visually-hidden` 유틸리티 (`display:none`은 스크린리더에서도 사라짐).

### 1.4 네이밍·포맷

- 들여쓰기 **2칸**, 속성은 **큰따옴표**, 불리언 속성은 값 생략, 속성 순서: `id → class → data-* → 기타 → aria-*`.
- `id`는 JS 훅·앵커·`label` 연결에만. 스타일링에 사용하지 않는다.
- JS 훅은 `data-js="…"` 또는 `data-*` 속성으로 분리 (스타일 클래스와 결합 금지).

## 2. CSS

### 2.1 아키텍처 (MUST)

- **BEM 변형 네이밍**: `.block`, `.block__element`, `.block--modifier`. 상태는 `.is-open`, `.is-active`, `[aria-expanded="true"]`.
  ```css
  .card { … }
  .card__title { … }
  .card--featured { … }
  ```
- **선택자 구체성 최소화**: 클래스 하나(0,1,0)를 기준. **`id` 선택자 금지, `!important` 금지**(유틸리티 예외 시 주석), 3단계 이상 중첩 금지.
- 요소 선택자(`div`, `section`)로 컴포넌트 스타일링 금지 (`base.css`의 요소 기본값 제외).
- **`@layer`로 우선순위 제어**:
  ```css
  @layer reset, tokens, base, layout, components, utilities;
  ```
- 컴포넌트는 **자체 완결**: 한 파일에 해당 컴포넌트의 모든 상태·반응형·변형 포함.
- 섹션 간 간격은 **한 가지 방식**(예: `section + section` 또는 `.section { padding-block }`)으로만 정의해 규칙이 서로 상쇄되지 않게 한다.

### 2.2 작성 규칙

- **값은 토큰만**: 색·간격·글자·그림자·라운드·모션·z-index 모두 변수.
- **논리 속성 우선**: `margin-inline`, `padding-block`, `inset-inline-start` (RTL·다국어 대비).
- 레이아웃은 **Flexbox**(겉박스 > `.inner-box` > 파티션). Grid는 **파티션 안쪽 내용박스에서 2차원 배치가 필요할 때만** 사용. `float`·`position:absolute`로 레이아웃 잡기 금지. 간격은 `gap` 사용 (margin 해킹 금지).
- 단위: 폰트 `rem`, 간격 `rem`/토큰, 테두리 `px`, 비율 `%`/`fr`/`ch`, 뷰포트 `dvh/svh`(모바일 주소창 대응). `vh` 높이 100% 고정 지양.
- `z-index`는 토큰 스케일(`--z-dropdown: 100; --z-sticky: 200; --z-modal: 1000; --z-toast: 1100`). 임의 `9999` 금지.
- `reset`은 최소화: `box-sizing: border-box`, 마진 제거, `img { max-width:100%; display:block }`, 폼 요소 `font: inherit`.
- 속성 순서: **위치 → 박스 모델 → 타이포 → 시각 → 기타**.
- 벤더 프리픽스 수동 작성 금지. 지원 필요 시 `@supports` 사용.
- **Hover**는 `@media (hover: hover)` 안에서만, 모션은 아래처럼:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  }
  ```
- 다크 모드·고대비(`prefers-contrast`)·강제 색상(`forced-colors`) 환경에서 깨지지 않게 한다.

### 2.3 성능

- 첫 화면에 필요한 CSS는 가볍게 유지, 사용하지 않는 규칙을 남기지 않는다.
- `will-change` 남용 금지. 애니메이션은 `transform/opacity`.
- 폰트: `woff2`, `font-display: swap`, 필요한 글리프/굵기만 로드, 핵심 폰트 `preload`.

## 3. JavaScript

### 3.1 기본 규칙 (MUST)

- **ES Modules** 사용, 전역 변수·전역 함수 금지. `"use strict"`는 모듈에서 기본 적용.
- `const` 기본, 재할당 필요 시 `let`, **`var` 금지**. `==` 금지(`===`만).
- 최신 문법 활용: 옵셔널 체이닝, `??`, 구조 분해, `async/await`, `Array` 고차 함수, `structuredClone`.
- 함수는 **하나의 일**, 길이 **40줄 이내**, 인자 **3개 이하**(초과 시 객체). 중첩 **3단계 이내**(조기 반환 사용).
- 매직 넘버·문자열 금지 → `config.js`의 상수로.
- 네이밍: 변수·함수 `camelCase`(동사로 시작: `getUser`, `isOpen`), 상수 `UPPER_SNAKE_CASE`, 클래스 `PascalCase`, 불리언은 `is/has/can` 접두.
- 세미콜론 사용, 문자열은 작은따옴표 또는 템플릿 리터럴, 들여쓰기 2칸, 후행 쉼표(ES5+) 사용.

### 3.2 DOM·이벤트

- 셀렉터는 `data-js` 속성 기준. 클래스·태그 구조에 의존하지 않는다.
  ```js
  const toggle = document.querySelector('[data-js="nav-toggle"]');
  ```
- 쿼리는 **한 번만** 하고 캐시한다. 루프 안에서 DOM 접근·`innerHTML +=` 금지.
- **이벤트 위임** 우선. 리스너는 해제 가능하게(`AbortController` 또는 `{ once: true }`).
- 스크롤·리사이즈·입력 이벤트는 `{ passive: true }`, 필요 시 throttle/debounce. 스크롤 감지는 **`IntersectionObserver`**, 크기 감지는 **`ResizeObserver`** 사용.
- 스타일 변경은 `element.style` 직접 조작이 아니라 **클래스/데이터 속성 토글**. 동적 값만 CSS 변수로 전달(`el.style.setProperty('--x', v)`).
- **초기화 패턴**:
  ```js
  export function initNav(root = document) {
    const el = root.querySelector('[data-js="nav"]');
    if (!el) return;            // 요소가 없어도 에러 없이 종료
    // …
  }
  ```
  `main.js`는 `DOMContentLoaded` 후 각 `init*`만 호출한다.
- 상태는 **DOM이 아닌 변수/데이터 속성/ARIA**에서 단일 소스로 관리하고 UI는 그것을 반영.

### 3.3 비동기·에러 처리

- `fetch`는 래퍼 함수로 감싸 **`response.ok` 확인, 타임아웃(`AbortSignal.timeout`), 에러 처리**를 일원화.
- `try/catch`는 **의미 있는 처리**를 할 때만. 에러를 삼키지 않는다(빈 `catch` 금지). 사용자에게는 이해 가능한 문구로 표시.
- 로딩·성공·실패·빈 상태 **4가지 UI 상태**를 모두 구현.
- 사용자 입력은 **항상 검증**(클라이언트 UX용) — 신뢰는 서버에서 확정.

### 3.4 저장소·URL

- `localStorage` 접근은 `try/catch`로 감싸고(차단·용량 초과 대비), 키는 `프로젝트명:기능:키` 형식으로 네임스페이스화. **민감 정보 저장 금지.**
- 상태 공유가 필요한 화면은 URL(`searchParams`/hash)에 반영해 새로고침·공유가 되게 한다.

## 4. 보안 (MUST)

- **`innerHTML`에 사용자 입력·외부 데이터 삽입 금지** → `textContent` / `createElement` / `<template>` 사용. 불가피하면 반드시 sanitize.
- `eval`, `new Function`, `document.write`, `javascript:` URL 금지.
- 외부 스크립트는 **SRI(`integrity`) + `crossorigin`** 적용, 정확한 버전 고정(`@latest` 금지).
- 비밀키·토큰·API 키를 클라이언트 코드·저장소에 넣지 않는다.
- 서버 설정 가능 시 **CSP, `X-Content-Type-Options`, `Referrer-Policy`** 헤더 권장. 폼은 CSRF 대책 전제.
- 서드파티 임베드(`iframe`)는 `sandbox`, `loading="lazy"`, `title` 지정.

## 5. 성능 (목표: Lighthouse 모바일 ≥ 90)

| 지표 | 목표 |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| 총 JS (gzip) | ≤ 100KB |
| 총 CSS (gzip) | ≤ 50KB |
| 이미지 1장 | ≤ 200KB (히어로 ≤ 300KB) |

- 이미지: **AVIF/WebP + 적절한 크기 + `srcset`**. 첫 화면 외 `lazy`.
- 폰트·핵심 CSS·LCP 이미지는 `preload`, 외부 도메인은 `preconnect`.
- JS는 **필요한 페이지에서만** 동적 `import()`. 메인 스레드를 오래 점유하는 작업(50ms↑)은 분할.
- 레이아웃 스래싱 금지(읽기·쓰기 일괄 처리), `requestAnimationFrame` 활용.
- 캐시 가능하도록 파일명 해시/버전 쿼리 전략을 문서화.

## 6. SEO·메타

- 페이지당 고유 `title`·`description`·`canonical`, OG/Twitter 카드 지정.
- `h1`에 페이지 핵심 주제, 링크 텍스트는 목적지를 설명("여기를 클릭" 금지).
- `robots.txt`, `sitemap.xml`, 구조화 데이터(JSON-LD)는 해당 시 추가.
- 404 페이지 별도 제공(홈 복귀·검색 안내).

## 7. 브라우저 지원·호환

- 지원 기준: **최근 2개 메이저 버전의 Chrome, Edge, Safari(iOS 포함), Firefox, Samsung Internet**. IE 지원하지 않음.
- 신규 CSS/JS 기능은 사용 전 지원 현황을 확인하고, 미지원 시 **점진적 향상**(`@supports`, 기능 감지)으로 대응. UA 스니핑 금지.
- JS 비활성 환경에서도 **핵심 콘텐츠와 링크는 접근 가능**해야 한다(점진적 향상).

## 8. 품질·협업

### 8.1 코드 품질

- 데드 코드·주석 처리된 코드·미사용 변수/CSS 제거.
- 주석은 **의도·배경·함정**만 기재. 코드를 그대로 번역하는 주석 금지. 파일 상단에 한 줄 목적 설명 가능.
- 복잡한 CSS 해킹·우회에는 **이유와 제거 조건**을 주석으로 남긴다.
- 코드 포맷은 프로젝트 설정(`.editorconfig`, Prettier/ESLint 사용 시 그 규칙)을 따른다.

### 8.2 Git

- 커밋 메시지 (Conventional Commits): `feat:`, `fix:`, `style:`, `refactor:`, `perf:`, `docs:`, `chore:` + 명령형 요약(한글 가능).
- 커밋은 **하나의 논리적 변경**. 디자인 토큰 변경과 기능 변경을 한 커밋에 섞지 않는다.
- 브랜치: `feature/…`, `fix/…`, `chore/…`.

### 8.3 변경 시 응답 형식 (에이전트 → 사용자)

작업 완료 보고에는 다음을 **간결하게** 포함한다.

1. **무엇을 바꿨는지** (파일 단위)
2. **적용한 가정**과 결정 이유
3. **확인 방법** (어느 뷰포트/브라우저에서 무엇을 보면 되는지)
4. **남은 이슈/제안** (있을 때만)

---

# PART 3. 사이트 전용 규칙 — IBK (https://www.ibk.co.kr/)

> **적용 원칙**: 박스 수치·글자·색상은 타겟 사이트와 **동일**하게, 내부 레이아웃은 아래 **단순화 구조**로 구현한다.
> **우선순위**: 이 PART는 PART 1·2 일반 규칙보다 우선한다. 단, **접근성·보안(§0.2)은 이 PART보다 우선**한다. 사이트 값이 AA 대비·터치 타깃 기준에 못 미치면 기준을 만족하는 가장 가까운 값으로 보정하고, 보정 사실을 주석과 보고에 기록한다 (사용자가 원본 유지를 명시하면 원본값 + 사유 기록).
> **값 상태**: PART 3의 값은 사용자가 제공한 사이트 소스(메인 HTML + `common.css`·`layout.css`·`main.css`·`main2023.css`)에서 추출했다. `미확정`은 소스에서 확인되지 않은 값이므로 임의로 채우지 말고 사용자에게 요청한다.

## 3.1 박스 구조 (MUST)

**겉박스 > 속박스(`.inner-box`) > 파티션** 3단계만 사용한다.

```html
<body>
  <header class="outer-box site-header">
    <div class="inner-box">
      <div class="partition">…</div>
    </div>
  </header>

  <main>
    <section class="outer-box">
      <div class="inner-box">
        <div class="partition">…</div>
        <div class="partition">…</div>
      </div>
    </section>
  </main>

  <footer class="outer-box site-footer">
    <div class="inner-box">
      <div class="partition">…</div>
    </div>
  </footer>
</body>
```

- 페이지 전체 구조는 **`header + (main > section) + footer`** 로 고정한다.
- **겉박스** = `header`, `main` 안의 `section`, `footer`. `main`은 `section`들의 래퍼일 뿐 박스 스타일을 갖지 않는다.
- 겉박스의 직계 자식은 `.inner-box` **1개**, `.inner-box`의 직계 자식은 **파티션**이다.
- 겉박스 안에 겉박스, 속박스 안에 속박스를 중첩하지 않는다. 3단계를 넘는 래퍼 `div` 추가 금지.
- 겉박스는 **전폭 + 배경 + 세로 패딩(섹션 리듬)** 만 담당한다. 가로 폭 제한은 속박스만 한다.
- 클래스명 `.outer-box`, `.partition`은 제안명이며, 변경 시 이 문서를 먼저 수정한다.

## 3.2 속박스·파티션 규칙 (MUST)

```css
@layer layout {
  .outer-box   { width: 100%; padding-block: var(--outer-padding-block); }
  .inner-box   { width: 100%; max-width: var(--inner-max); margin-inline: auto; padding-inline: var(--inner-padding-inline); }
  .partition   { display: flex; gap: var(--partition-gap); }
  .partition--wrap { flex-wrap: wrap; }
  .inner-box--narrow { max-width: var(--inner-max-narrow); }
}
```

```css
/* tokens.css */
--inner-max: 1000px;         /* 메인 콘텐츠 폭 (사이트 고정 width 1000px) */
--inner-max-narrow: 940px;   /* 헤더·푸터·서브 콘텐츠 폭 (사이트 940px) */
--inner-max-fallback: 1920px; /* 폭 값이 전혀 없는 영역에만 사용 */
```

**속박스**
- `max-width` 적용 + **중앙정렬**(`margin-inline: auto`). 사이트 값이 없으면 **1920px**.
- 이 사이트는 `max-width`가 아니라 **고정 `width`**(메인 1000px, 헤더·푸터·서브 940px)를 쓴다. 그 값을 `max-width`로 옮겼고, 1920px은 폭 값이 전혀 없는 영역의 폴백이다.
- 헤더·푸터 속박스는 `.inner-box--narrow`(940px)를 추가한다. 메인과 한 폭으로 통일할지는 사용자가 결정한다.
- 이름은 **`.inner-box`로 일원화**한다. `.container`, `.wrapper`, `.inner`, `.contents` 등 다른 이름 금지.

**파티션**
- 일반적으로 **flex** 박스를 적용한다.
- 내용이 줄바꿈되어야 할 때만 `.partition--wrap`(`flex-wrap: wrap`)을 적용한다. 기본은 줄바꿈 없음.
- 자식 폭은 `flex: 1 1 <basis>` 또는 `flex-basis`로 정하고, 간격은 `gap`으로 한다.
- 방향 전환(예: 모바일 세로 배치)은 `flex-direction`으로 처리한다.
- **파티션을 Grid로 만들지 않는다.** 2차원 배치가 필요하면 파티션 **안쪽 내용박스**에 `display: grid`를 적용한다.

## 3.3 박스 수치 — 크기·패딩·마진 (사이트 추출값)

값은 `tokens.css`에만 정의하고 컴포넌트는 변수만 참조한다. 사이트 값이 8pt 배수가 아니어도 그대로 토큰화한다. 모바일 값은 `max-width: 767px` 기준(별도 표기 시 959px).

**영역(겉박스·속박스)**

| 대상 | 토큰 | 데스크톱 | 모바일 | 출처 |
|---|---|---|---|---|
| 속박스 폭(메인) | `--inner-max` | 1000px | 100% | main2023 `.visual_inner` 등 |
| 속박스 폭(헤더·푸터·서브) | `--inner-max-narrow` | 940px | 100% | layout `.gnb_wrap`, `#container`, `.inner_footer` |
| 속박스 좌우 패딩 | `--inner-padding-inline` | 0 | 15px | main2023 `.service_contents`, `.btm_service_contents` |
| 헤더 높이 | `--header-height` | 76px | auto (≤959px: 패딩 10px 44px 14px) | layout `.main_gnb` |
| 헤더 로고 높이 / 상단 여백 | `--logo-height` | 35px / 20px | 29px / 0 | layout `#header h1 a img` |
| 비주얼 영역 세로 패딩 | `--visual-padding-block` | 30px 40px | 30px 20px | main2023 `.main_visual_wrap` |
| 비주얼 콘텐츠 높이 / 상단 패딩 | `--visual-height` | 420px / 40px | 436px / 0 | main2023 `.visual_inner` |
| 서비스 영역 세로 패딩 | `--service-padding-block` | 74px 40px | 80px 20px | main2023 `.service_contents` |
| 하단 서비스 세로 패딩 | `--btm-padding-block` | 40px | 40px | main2023 `.btm_service_contents` |
| 푸터 상단 여백 / 하단 패딩 | `--footer-margin-top`, `--footer-padding-bottom` | 26px / 29px | 13px / 14px | layout `.inner_footer` |
| 푸터 좌우 패딩 | `--footer-padding-inline` | 0 (960px 이상) | 15px | layout `#footer .inner_footer` |

**컴포넌트**

| 대상 | 토큰 | 값 |
|---|---|---|
| 카드 폭 | `--card-width` | 320px (320×3 + 간격 20×2 = 1000px, 모바일 100%) |
| 카드 패딩 | `--card-padding` | 80px 30px 30px (상단 80px은 제목 영역) |
| 카드 간격(파티션 간격) | `--partition-gap` | 20px (모바일 세로 20px) |
| 카드 라운드 | `--radius-lg` | 30px |
| 카드 그림자 | `--shadow-card` | `0 43px 81px rgba(0,0,0,.08)` (사이트의 유일한 그림자 단계) |
| 카드 변형 라운드 | `--radius-card-prd`, `--radius-card-board` | `60px 60px 6px 90px`, `30px 30px 45px 45px` |
| 서비스 메뉴 바 | `--service-bar-*` | 폭 1000px, 높이 74px, 라운드 24px / 모바일 높이 80px, 좌우 마진 15px, 라운드 20px |
| 서비스 메뉴 링크 | — | 패딩 30px 30px, 높이 74px / 모바일 패딩 0 15px, 높이 40px, 구분선 1px×18px |
| 버튼(로그인 등) | `--button-height`, `--radius-sm` | 높이 40px, 폭 114px, 라운드 20px(완전한 알약형) |
| 목록 항목(게시판) | — | 패딩 13px 0, 상단 구분선 1px, 제목 높이 2.4em / 행간 1.2em |
| 서비스 타일(몰) | — | 3열 `calc((100% - 20px) / 3)`, 높이 80px, 가로 간격 10px·세로 간격 20px, 라운드 30px, 아이콘 40px |
| 아이콘 | — | 앱 72px, 알림 70px, 몰 40px, 슬라이더 컨트롤 22px |
| 영상 썸네일 | — | 192×108px, 간격 30px |
| 하단 서비스 영역 | — | 앱 목록 폭 540px(항목 135px), 영상 목록 폭 415px(왼쪽 여백 45px) |

- 라운드 토큰은 `--radius-sm: 20px`, `--radius-md: 24px`, `--radius-lg: 30px` 3단계로 두고, 비대칭 카드는 위 변형 토큰으로 별도 관리한다.
- `z-index`: 헤더는 사이트 값 20을 유지하되 일반 규칙의 토큰 스케일(`--z-sticky` 등)에 매핑한다.

## 3.4 글자 규칙 (사이트 추출값)

**서체**: 본문 `IBKiDreamL`(Light), 제목·강조 `IBKiDreamB`(Bold). 폴백은 사이트 정의대로 `Arial, 'Noto Sans KR', sans-serif`.

```css
--font-sans: "IBKiDreamL", Arial, "Noto Sans KR", sans-serif;
--font-heading: "IBKiDreamB", Arial, "Noto Sans KR", sans-serif;
```

- 일반 규칙의 Pretendard 기본값 대신 위 서체를 쓴다. 서체 2종 제한은 그대로 지킨다.
- **폰트 파일(`IBKIDreamWebL/B`의 eot·woff·ttf)은 제공받은 소스에 없다.** 파일과 라이선스를 확인하기 전에는 `@font-face`를 만들지 않고 폴백 스택만 쓴다. 확보 후에는 woff2로 변환해 `font-display: swap`을 적용한다.
- 사이트의 `* { font-family: 'IBKiDreamL' !important }` 전역 지정은 **이식하지 않는다**(`!important`·`*` 금지). `body`에 `--font-sans`, 제목·강조 요소에 `--font-heading`을 지정한다.
- 굵기는 파일 전환(L/B)으로 표현한다. 사이트가 `font-weight: 500`을 함께 쓰는 요소도 `--font-heading` 하나로 처리한다.

**크기·행간·자간** (기준 `html { font-size: 100% }` = 16px, 사이트 `.main_contents`와 동일. 사이트 `body` 12px는 쓰지 않는다)

| 역할 | 데스크톱 | 모바일 | 서체 | 행간 | 자간 |
|---|---|---|---|---|---|
| 비주얼 메인 제목 | 2.5rem (40px) | 1.38rem (22px) | B, 강조어는 `#004f9d` | 1.2 / 모바일 1.1 | -0.05em |
| 비주얼 서브 제목 | 1.38rem (22px) | 1rem | L | 모바일 1.1 | — |
| 비주얼 설명 | 1rem | 0.88rem | L | 1.25 | — (`word-break: keep-all`) |
| 카드 큰 제목 | 1.5rem (24px) | 동일 | B | 1.1~1.25 | -1px |
| 카드 섹션 제목(h3) | 1.125rem (18px) | 동일 | L | — | — |
| 알림 제목 | 1.13rem | 동일 | B | — | -2px |
| 서비스 메뉴 | 1.21rem | 0.94rem | L, 흰색 | — | — |
| 본문·링크 | 1rem | 동일 | L | 1.2~1.5 | — |
| 보조(날짜·캡션) | 0.88rem (14px) | 동일 | L | — | — |
| 슬라이더 카운트 | 14px | 동일 | L | 22px | — |
| 푸터 | body 상속 12px (전용 지정 없음) | 동일 | L | 19px | -1px |

- 푸터처럼 사이트가 12px 이하를 쓰는 영역도 일반 규칙의 본문 최소 16px와 충돌한다. 사이트 값(12px)을 기본으로 따르되, 사용자가 접근성 우선을 요청하면 14px 이상으로 보정하고 기록한다.
- 자간 -1px, -2px는 사이트 값이므로 그대로 토큰화한다 (`--ls-title`, `--ls-notify`).

## 3.5 색상 규칙 (사이트 추출값)

| 구분 | 토큰 | 값 | 사용처 | 흰색 대비 |
|---|---|---|---|---|
| 브랜드 주조 | `--color-primary` | `#004f9d` | 서비스 메뉴 바 배경, 제목 강조어, 보조 버튼 글자 | 8.06 |
| 브랜드 버튼 | `--color-primary-button` | `#004ca5` | 로그인 버튼 배경·테두리 (주조색과 거의 같음, 통합 여부는 사용자 결정) | 8.15 |
| 강조(링크 블루) | `--color-accent` | `#0082c1` → **`#007dba`로 보정** | 카드 h3, 날짜 | 4.23 → 4.52 |
| 본문 텍스트 | `--color-text` | `#333` | 메인 본문, 링크 | 12.63 |
| 보조 텍스트 | `--color-text-muted` | `#666` | 설명, 카운트, 밑줄 링크 | 5.74 |
| 서브·푸터 기본 텍스트 | `--color-text-base` | `#575757` | body 기본색 | 7.23 |
| 푸터 링크 | `--color-footer-link`, `--color-footer-strong` | `#0f53a8`, `#27496f` | 푸터 링크, 굵은 안내 | 7.44, 9.26 |
| 배경 | `--color-bg` | `#fff` | 카드, 헤더 | — |
| 영역 배경 | `--color-surface-alt` | `#e9eef2` | 서비스 영역 | — |
| 호버 배경 | `--color-hover-bg` | `#f0f7ff` | 몰 타일 hover·focus | — |
| 테두리 | `--color-border`, `--color-border-list`, `--color-border-footer`, `--color-border-header` | `#e6eaeb`, `#f0f0f0`, `#d6e0df`, `#dde9f5` | 구분선, 목록, 푸터 상단, 모바일 헤더 하단 | — |
| 메뉴 구분선 | `--color-divider-on-primary` | `rgba(255,255,255,.15)` | 서비스 메뉴 바 | — |
| 그림자 | `--shadow-card` | `rgba(0,0,0,.08)` | 카드 | — |
| 서브페이지 포인트 | `--color-point` | `#f2631b` → 글자용은 **`#cd4d0c`로 보정** | 페이징 현재 페이지 | 3.19 → 4.51 |
| 포커스 링 | `--color-focus` | `var(--color-primary)` (사이트 미정의, 일반 규칙의 focus-visible을 위해 보완) | 모든 인터랙티브 요소 | — |
| 상태색(성공·경고·오류·정보) | `--color-success/warning/danger/info` | 미확정 (메인 소스에서 용도가 확인된 값 없음) | — | — |

- 대비 미달 색 2개(`#0082c1`, `#f2631b`)는 §0.2에 따라 보정값을 쓴다. 원본 유지를 원하면 사용자가 명시해야 하며, 그때도 보정 사유를 주석에 남긴다.
- 메인 소스에는 `#000`과 `#fff`가 모두 쓰인다. 사이트 값이므로 일반 규칙의 순수 흑백 회피를 따르지 않는다.
- `#333 on #e9eef2`(10.82)와 `#666 on #e9eef2`(4.92)는 통과한다. `#0082c1 on #e9eef2`(3.62)는 실패하므로 영역 배경 위에서 `--color-accent`를 글자색으로 쓰지 않는다.

## 3.6 반응형 구간 (사이트 추출값)

사이트는 데스크톱 우선(`max-width`)이고 전환 경계가 둘로 나뉜다.

| 경계 | 사이트 규칙 | 적용 내용 |
|---|---|---|
| 959px 이하 | `layout.css` | 헤더가 모바일형(메뉴 숨김·로고 중앙·패딩 10px 44px 14px)으로 바뀌고, 푸터 속박스가 690px로 줄어듦 |
| 767px 이하 | `main2023.css` | 메인 콘텐츠가 100% 폭·15px 좌우 패딩, 카드는 1열 세로 배치, 서비스 바는 높이 80px |
| 1200px 이상 | `main2023.css` | 서비스 영역에 우상단 배경 이미지 추가 |
| 320~374 / 375~767 | `main2023.css` | 서비스 메뉴 링크 패딩 미세 조정 |

```css
/* tokens.css — 모바일 퍼스트로 변환 (max-width 767/959 = min-width 768/960) */
--bp-md: 768px;   /* 메인 콘텐츠 전환 */
--bp-lg: 960px;   /* 헤더·푸터 전환 */
--bp-xl: 1200px;  /* 배경 이미지 */
```

- 일반 규칙의 구간(480/768/1024/1280/1536)보다 위 사이트 구간이 우선한다. 모바일 퍼스트 원칙은 유지하고, 경계값만 사이트와 맞춘다.
- 768~959px 구간의 메인 콘텐츠 세부 값은 소스에서 확인되지 않았다. 이 구간은 `.inner-box`의 `max-width`와 `flex-wrap`으로 처리하고, 사이트와 다르게 보이면 사용자에게 확인한다.

## 3.7 이식하지 않는 사이트 CSS 패턴

| 사이트 패턴 | 처리 |
|---|---|
| `* { font-family: ... !important }` 전역 지정 | 금지. §3.4처럼 `body`와 제목에 토큰으로 지정 |
| `float` 레이아웃, IE 핵(`*width`, `\0/IE8+`), 인라인 트래킹 속성 | 사용하지 않음 |
| `.bx_cont`의 `position: absolute` + `top/left` 배치 | 사용하지 않음. 카드는 파티션(flex) 안에 순서대로 배치 (§3.2) |
| 이미지(gif)로 만든 GNB 메뉴 | 텍스트 링크로 구현. 메뉴 글자 크기·색은 미확정 |
| `em` 단위 중첩 | `rem` 토큰으로 변환(§3.4 표 기준) |
| 슬라이더 컨트롤 22×22px | 시각 크기는 유지하되 클릭 영역을 44×44px로 확장 |
| `body` 12px, 행간 19px 고정 | 본문 16px 기준으로 구현 |

## 3.8 아직 확정되지 않은 값

- GNB 메뉴(이미지)의 글자 크기·색, 전체 메뉴(`.ctg_wrap`) 수치
- 상태색(성공·경고·오류·정보)과 폼 오류 표시
- 서브페이지용 폼·표·페이징 컴포넌트 수치 (`common.css` 대부분이 해당, 필요한 화면이 정해지면 추출)
- IBKiDream 폰트 파일과 라이선스
- 768~959px 구간의 메인 콘텐츠 세부 값
- 값을 추가로 확정할 때는 이 문서의 표를 먼저 고치고 변경 이력에 기록한다. 측정은 1440px·390px 기준으로 한다.

---

# PART 4. 최종 체크리스트 (완료 전 필수 통과)

## Designer 체크

- [ ] 모든 색·글자·간격·그림자·라운드가 **토큰**을 사용한다 (하드코딩 0건)
- [ ] 박스·글자·색상 값이 PART 3의 사이트 토큰과 일치하고, 일반 규칙과 다른 값은 사유가 기록되어 있다
- [ ] 텍스트 대비 4.5:1 / UI 3:1 이상이다
- [ ] 타입 스케일·8pt 간격 규칙을 따른다
- [ ] 모든 인터랙티브 요소의 5가지 상태가 정의되어 있다 (focus-visible 포함)
- [ ] 터치 타깃이 44px 이상이다
- [ ] 360 / 390 / 768 / 1024 / 1440px에서 깨지지 않는다
- [ ] 모션은 의미가 있고 `prefers-reduced-motion`을 지원한다
- [ ] 문구가 능동형·일관된 어체이며 오류 메시지는 해결 방법을 안내한다
- [ ] "범용 AI 디자인" 패턴을 무의식적으로 쓰지 않았다

## Developer 체크

- [ ] HTML 유효성: `lang`, 단일 `h1`, 단일 `main`, 제목 레벨 순서, `alt`, `label` 확인
- [ ] 클릭 가능한 모든 요소가 `button`/`a`이고 **키보드만으로 조작**된다
- [ ] 인라인 스타일·인라인 이벤트·`id` 선택자·`!important`·`var` 없음
- [ ] `innerHTML`로 외부/사용자 입력을 삽입하지 않았다
- [ ] 로딩·성공·오류·빈 상태가 모두 구현되었다
- [ ] 콘솔 에러/경고 0건, `console.log` 제거
- [ ] 이미지에 `width/height`가 있고 CLS가 발생하지 않는다
- [ ] Lighthouse(모바일): Performance / Accessibility / Best Practices / SEO 모두 **90+**
- [ ] 프로젝트 구조·네이밍 규칙을 따랐고 불필요한 파일 변경이 없다
- [ ] 골격이 `header + (main > section) + footer`이고, 모든 겉박스가 `.inner-box` > 파티션 순서를 지킨다 (파티션에 Grid 없음)
- [ ] 변경 사항 보고(§8.3)를 작성했다

---

## 부록: 규약 위반 시 에이전트의 행동

1. 사용자의 요청이 이 규약과 **충돌**하면 → 규약을 지킨 대안을 제시하고, 사용자가 명시적으로 원하면 **위반 사유를 코드 주석과 보고에 기록**한 뒤 진행한다.
2. 규약에 **없는 상황**이면 → 기존 코드의 패턴을 따르고, 새 패턴을 만들었다면 이 문서에 추가할 항목을 제안한다.
3. 이 문서는 **살아있는 문서**다. 프로젝트 진행 중 합의된 변경은 즉시 반영하고, 변경 이력을 아래에 기록한다.

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-11-02 | 최초 작성 | — |
| 2026-11-02 | IBK 사이트 전용 규칙(PART 3) 추가, 컨테이너·Grid 관련 일반 규칙 수정, 체크리스트를 PART 4로 이동 | — |
| 2026-11-02 | 사이트 HTML·CSS 분석값 반영: 박스 수치·글자·색상·반응형 구간 확정(PART 3 §3.3~3.8), 속박스 폭 1000/940px로 확정 | — |