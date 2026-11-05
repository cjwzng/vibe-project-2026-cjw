/**
 * 데이터 모델 정의 (JSDoc 타입).
 * 지침: NoSQL(Firestore) 친화적 문서 구조 / id 는 string / 날짜는 ISO 8601 문자열.
 * 연관 데이터(author, attachments)는 조인 없이 문서 안에 임베딩한다.
 */

/**
 * 첨부파일 메타데이터 (파일 본문은 문서에 넣지 않는다)
 * @typedef {Object} AttachmentMeta
 * @property {string} id            crypto.randomUUID()
 * @property {string} name          원본 파일명
 * @property {number} size          bytes
 * @property {string} type          MIME type
 * @property {string} storagePath   저장소 경로 (Firebase Storage 경로로 그대로 사용)
 * @property {string|null} url      다운로드 URL (Mock: null / Firebase: getDownloadURL 결과)
 */

/**
 * @typedef {'general'|'event'|'system'|'etc'} NoticeCategory
 */

/**
 * 공지사항 문서
 * @typedef {Object} Notice
 * @property {string} id              문서 고유 ID (crypto.randomUUID() 또는 Firestore doc.id)
 * @property {number} postNo          화면 표시용 게시번호 (서비스가 부여, ID 와 별개)
 * @property {string} title
 * @property {string} content         정제(sanitize)된 HTML
 * @property {NoticeCategory} category
 * @property {boolean} isImportant    true 이면 목록 상단 고정
 * @property {{id: string, name: string}} author   비정규화: 작성자 정보 임베딩
 * @property {AttachmentMeta[]} attachments
 * @property {number} viewCount
 * @property {string} createdAt       ISO 8601 ("2026-11-04T12:00:00.000Z")
 * @property {string} updatedAt       ISO 8601
 */

/**
 * 생성 DTO: id / postNo / viewCount / 타임스탬프는 서비스가 채운다.
 * @typedef {Omit<Notice, 'id'|'postNo'|'viewCount'|'createdAt'|'updatedAt'>} CreateNoticeDto
 */

/**
 * 수정 DTO
 * @typedef {Partial<CreateNoticeDto>} UpdateNoticeDto
 */

/**
 * update() 옵션
 * @typedef {Object} UpdateOptions
 * @property {boolean} [touchUpdatedAt=true]  false 이면 updatedAt 을 유지한다.
 */

/**
 * NoticeService 계약 (Mock / Firebase 구현체가 동일하게 지켜야 한다)
 *
 * - getAll():                      Promise<Notice[]>
 * - getById(id):                   Promise<Notice|null>          없으면 null
 * - create(dto):                   Promise<Notice>
 * - update(id, dto, options?):     Promise<Notice>               없으면 throw Error
 * - delete(id):                    Promise<void>
 * - increaseViewCount(id):         Promise<Notice|null>          없으면 null
 *
 * AttachmentService 계약
 * - upload(file):                  Promise<AttachmentMeta>
 * - getDownloadUrl(meta):          Promise<string|null>
 * - remove(meta):                  Promise<void>
 * - uploadInlineImage(file):       Promise<string>               에디터 본문 이미지 URL
 */
export {};
