# SayToPay — DEVLOG


PayPal AI Hackathon 2026 출품작 제작·QA 로그. 제출 마감 2026-11-13 05:00 KST (Devpost).
작업 방식: 회차마다 단위 1개를 실행하고, 직접 검증한 것만 완료로 기록한다.

## 1회차 — 2026-11-08 18:34 KST · 카테고리: 최소 범위 구축

### 한 일
- 프로젝트 신규 생성: `~/workspace/projects/paypal-hackathon` (이름 SayToPay)
  - `src/parseOrder.js` + `src/catalog.js` — 자연어 한 문장 → 주문 항목·수량·합계 변환 (AI 요소는 이 한 곳만). 결정적 오프라인 파서라 API 키 없이 로컬에서 동작하고, LLM 호출로 교체 가능한 함수 경계로 분리함.
  - `src/paypal.js` — PayPal Orders v2 클라이언트: 액세스 토큰 → 주문 생성(승인 URL 반환) → 캡처. 기본값 샌드박스(`api-m.sandbox.paypal.com`), 라이브는 `PAYPAL_ENV=live` 명시 시에만.
  - `src/server.js` + `public/` — 로컬 웹 UI와 API(`/api/parse`, `/api/orders`, `/api/orders/capture`, `/api/health`). 의존성 없는 Node.js(>=18) 단일 실행.
  - `LICENSE` (MIT), `README.md` (실행 방법·구조·샌드박스 안내), `.env.example`, `.gitignore`
  - `test/` — 파서 테스트 4개 + 흐름 테스트 2개

### 감독 검증 (직접 실행)
- `npm test` 6개 전부 통과. 흐름 테스트는 PayPal API 로컬 스탠드인(토큰·주문 생성·승인·캡처, 승인 전 캡처는 422로 거부)에 앱 코드를 그대로 물려 parse → create(CREATED, 승인 URL) → approve → capture(COMPLETED, captureId MOCK-CAPTURE-9KD55210, $45.50)를 끝까지 확인.
- 테스트 중 실제 결함 1건 발견·수정: "notebook"이 "book"으로도 중복 매칭됨 → 긴 키워드 우선·구간 점유 방식으로 파서 수정 후 재통과.
- 실제 서버 기동 스모크: `/api/health` 정상(paypalEnv=sandbox, credentialsConfigured=false), `/api/parse` 정상($45.50), UI 페이지 서빙 정상, 자격증명 없을 때 `/api/orders`는 503 `paypal_credentials_missing`로 명시 거부.
- 공개 자료 개인정보 스캔: 실명·연락처·소속·회사(LS) 표현 0건.

### 완료로 기록하지 않는 것 (막힌 지점 2건)
1. **실제 PayPal 샌드박스 흐름 미검증** — 샌드박스 앱의 Client ID/Secret이 이 환경 어디에도 없음(환경변수·프로젝트 파일 확인). PayPal Developer 대시보드 로그인으로 샌드박스 앱을 만들고 자격증명을 보안 경로로 넣어야 다음 회차에서 실제 주문 생성→승인→캡처를 눈으로 확인할 수 있다. 코드 열람이나 로컬 스탠드인 통과를 실샌드박스 검증으로 기록하지 않는다.
2. **공개 GitHub 저장소 미생성** — GitHub 커넥터 `create_repository`(saytopay, public)로 시도했으나 `403 Resource not accessible by integration`으로 거부됨. 현 GitHub App 연동에는 저장소 생성 권한이 없다. 주인님이 github.com에서 빈 공개 저장소 `BoxLogoDev/saytopay`를 만들어 주시면 다음 회차가 스냅샷 푸시로 파일을 올릴 수 있다. (기존 저장소 17개 중 재사용 가능한 빈 저장소는 없음도 확인.)

### 다음 회차 제안
- 카테고리 로테이션상 다음은 QA. 단, 위 2건이 풀리면 QA 회차에서 ① 실제 샌드박스 끝까지 실행·거래 ID 확보 ② 저장소 푸시와 공개 링크 확인을 먼저 한다. 둘 다 막혀 있으면 데모·문안 카테고리(데모 영상 대본 확정, Devpost 문안 실측값 자리 확정)로 진행한다.

## 2회차 — 2026-11-08 19:34 KST · 카테고리: 데모·문안

### 판단 근거
- 직전 회차(최소 범위 구축)의 막힌 지점 2건이 그대로인지 먼저 재확인했다.
  - 실제 서버 스모크: `/api/health`가 `credentialsConfigured: false`를 반환 — 샌드박스 자격증명이 여전히 이 환경에 없다.
  - 공개 저장소: GitHub API 직접 조회는 프록시 Unicorn 페이지가 반환돼 단정 근거로 쓰지 않았다. 1회차의 커넥터 403 기록 이후 주인님이 저장소를 만들었다는 신규 증거도 없다.
- 따라서 DEVLOG 제안대로 QA 대신 데모·문안 카테고리 1단위를 수행했다(같은 카테고리 반복 아님).

### 한 일
- `DEMO_SCRIPT.md` 신규: 5문장 패킷을 2:20 목표(3:00 미만 엄수) 5장면 샷리스트로 확정. 장면별 화면·동작·내레이션 전문 포함. 예시 문장은 실제 UI 기본값과 일치하는 `2 coffee beans and a notebook`($45.50)로 고정.
  - 정직성 규칙 명기: 결제 장면(4~5)은 실제 샌드박스 실행이 성공한 뒤에만 촬영하고, 자격증명·실명·개인 메일·회사 관련 화면은 촬영 금지.
  - 촬영 가능 상태 구분: 장면 1~3은 오늘 촬영 가능, 장면 4~5는 자격증명 확보 후 QA 회차 통과 뒤 촬영.
- `DEVPOST_COPY.md` 신규: 제출 폼에 그대로 붙여 넣을 영문 문안 확정 — 제목·한 줄 설명·카테고리(AI Shopping Assistant/Agentic Commerce)·Inspiration/What it does/How we built it/Challenges/Accomplishments/Learned/What's next. "Built during the hackathon" 항목에 기간 중 전량 제작·기존 코드 재사용 없음으로 정직하게 기재. 빈칸은 실측값 자리([SANDBOX_ORDER_ID]·[SANDBOX_CAPTURE_ID]·[REPO_URL]·[VIDEO_URL])만 남겼다.
- `README.md` 정비: "Demo walkthrough (under 3 minutes)" 절 추가 — 4단계 순서와 $45.50 내역, DEMO_SCRIPT·DEVPOST_COPY 연결.

### 감독 검증 (직접 실행)
- `npm test` 6/6 통과 (재실행 확인).
- 실제 서버 기동 스모크 재확인: `/api/health` 정상(sandbox, credentialsConfigured=false), `/api/parse`가 예시 문장에 $45.50 초안 반환, UI 서빙 정상(제목 확인).
- 공개 자료 개인정보·회사 표현 스캔: README·DEMO_SCRIPT·DEVPOST_COPY·LICENSE·public·src·test·package.json 전체에서 실명·연락처·소속·회사(LS) 표현 0건.

### 완료로 기록하지 않는 것 (막힌 지점 — 1회차와 동일 2건, 변동 없음)
1. **실제 PayPal 샌드박스 흐름 미검증** — 샌드박스 앱 Client ID/Secret이 필요하다. PayPal Developer 대시보드에서 주인님 계정으로 샌드박스 앱을 만들고 자격증명을 보안 경로로 넣어야 한다.
2. **공개 GitHub 저장소 미생성** — 주인님이 github.com에서 빈 공개 저장소 `BoxLogoDev/saytopay`를 만들어 주시면 스냅샷 푸시가 가능하다.

### 다음 회차 제안
- 위 2건 중 하나라도 풀리면 QA 카테고리로 실제 샌드박스 끝까지 실행·거래 ID 확보와 저장소 푸시를 수행한다. 둘 다 막혀 있으면 기능 보강 카테고리(키트 범위 안의 작은 개선 1개)로 진행한다. 최종 제출 단계는 2026-11-12 18:00 KST 이후 첫 회차다.

## 3회차 — 2026-11-08 20:34 KST · 카테고리: 기능 보강

### 판단 근거
- 직전 회차(데모·문안)의 막힌 지점 2건을 먼저 재확인했다.
  - 환경변수 길이 검사: PAYPAL_CLIENT_ID·PAYPAL_CLIENT_SECRET 모두 길이 0, `.env` 파일 없음, 실제 서버 스모크에서 `/api/health`가 `credentialsConfigured: false` 반환 — 샌드박스 자격증명이 여전히 없다.
  - 공개 저장소: 프로젝트는 아직 git 저장소가 아니고(로컬 `git status` fatal), 1회차 커넥터 403 이후 주인님이 저장소를 만들었다는 신규 증거도 없다.
- 따라서 2회차 DEVLOG 제안대로 기능 보강 카테고리 1단위를 수행했다(같은 카테고리 반복 아님). 최종 제출 단계(2026-11-12 18:00 이후)가 아니므로 새 개선을 시작해도 되는 회차다.

### 한 일 — 편집 가능한 주문 초안 + 서버 측 가격 재계산
- 발견한 결함: 종전 `/api/orders`는 브라우저가 보낸 draft의 unitPrice·total을 그대로 믿어, 클라이언트가 가격을 $0.01로 변조하면 그 금액으로 주문이 생성될 수 있었다. 또 제출 패킷 문장 2의 '확인·수정할 수 있습니다'와 달리 UI에서 초안을 수정할 방법이 없었다.
- `src/draft.js` 신규 — `normalizeDraft()`: SKU+수량만 받아 카탈로그 가격으로 단가·행합계·총액을 서버에서 재계산한다. 미등록 SKU 제외, 중복 SKU 병합, 수량 1~99로 제한(0 이하는 항목 제거).
- `src/server.js` — 신규 엔드포인트 `POST /api/draft/normalize`(편집 후 재계산용) 추가, `/api/orders`는 draft를 반드시 `normalizeDraft()`를 거친 뒤 주문 생성하도록 변경.
- `public/` — 초안 표에서 수량 입력(number)과 Remove 버튼으로 편집 가능하게 하고, 편집 시 SKU+수량만 서버로 보내 재계산된 초안을 다시 그린다. 안내 문구와 스타일 추가.
- `test/draft.test.js` 신규 3개 + `test/flow.test.js`에 변조 흐름 테스트 1개 추가 — 총 테스트 6개 → 10개.
- `README.md`·`DEVPOST_COPY.md` 정비: 편집·재계산 설명과 테스트 수(10개)를 실측값으로 갱신.

### 감독 검증 (직접 실행)
- `npm test` 10/10 통과. 변조 테스트: 모든 항목을 $0.01로 조작한 draft를 보내도 정규화 총액 $45.50, 캡처 금액도 "45.50"으로 끝까지 확인했다(로컬 스탠드인 기준 — 실샌드박스 검증으로 기록하지 않는다).
- 실제 서버 기동 스모크: `/api/health` 정상(sandbox, credentialsConfigured=false), `/api/draft/normalize`가 변조 draft를 $45.50으로, 수량 편집(커피 3개·노트북 제거)을 $54.00으로 재계산, 자격증명 없을 때 `/api/orders`는 기존대로 503 명시 거부, UI에 재계산 안내와 normalize 호출이 실제로 서빙됨을 확인.
- 공개 자료 개인정보·회사 표현 스캔: 전체 파일에서 실명·연락처·소속·회사(LS) 표현 0건.

### 완료로 기록하지 않는 것 (막힌 지점 — 변동 없음)
1. **실제 PayPal 샌드박스 흐름 미검증** — 샌드박스 앱 Client ID/Secret이 필요하다. PayPal Developer 대시보드에서 주인님 계정으로 샌드박스 앱을 만들고 자격증명을 보안 경로로 넣어야 한다.
2. **공개 GitHub 저장소 미생성** — 주인님이 github.com에서 빈 공개 저장소 `BoxLogoDev/saytopay`를 만들어 주시면 스냅샷 푸시가 가능하다.

### 다음 회차 제안
- 위 2건 중 하나라도 풀리면 QA 카테고리로 실제 샌드박스 끝까지 실행·거래 ID 확보와 저장소 푸시를 수행한다. 둘 다 막혀 있으면 QA 카테고리(로컬 스탠드인 기준 회귀 검증 범위 안에서) 또는 데모 촬영(장면 1~3) 중 아직 안 한 쪽으로 진행하되, 같은 카테고리(기능 보강)는 반복하지 않는다. 최종 제출 단계는 2026-11-12 18:00 KST 이후 첫 회차다.

## 2026-11-08 21:0x 감독자 기록 — 샌드박스 자격증명 확보·주문 생성 검증 (페퍼 직접 수행)
- 주인님이 브라우저를 이어받아 PayPal Developer 로그인을 마쳤고, Sandbox "Default Application"의 Client ID·Secret을 확인해 프로젝트 `.env`(gitignore 대상)에 설정했다. 값은 이 로그에 남기지 않는다.
- 검증: `GET /api/health` → credentialsConfigured=true. `POST /api/orders` ("two coffees") → 실제 샌드박스 주문 생성 성공, order id 80L240628D934561M, status CREATED, approve 링크 발급 확인.
- 남은 검증: 구매자 승인 → 캡처. 승인에는 Sandbox 개인 테스트 계정(sb-472no453792325@personal.example.com)의 비밀번호가 필요하며, 대시보드 Accounts 페이지에서 확인해 브라우저로 승인 흐름을 밟을 것.
- 남은 막힘: 공개 GitHub 저장소 `BoxLogoDev/saytopay` 미생성 (주인님이 github.com에서 빈 공개 저장소를 만들면 스냅샷 푸시 가능).
