# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # build-data 후 dev 서버 (http://localhost:3000)
npm run build      # build-data 후 프로덕션 빌드
npm run build-data # data/raw/*.csv → public/data/regions/*.json (dev/build 전 자동 실행)
npm run check-raw  # 원본 CSV 검사 — data/raw에 파일을 넣은 직후, build-data 전에
npm run lint       # ESLint
npm run test       # build-data 후 vitest run
```

테스트는 총 67개다.

| 파일 | 개수 | 지키는 것 |
|---|---:|---|
| `src/lib/data.test.ts` | 28 | 빌드 산출물 회귀. 각 테스트가 `docs/spec.md` §5 결함 번호에 대응 |
| `scripts/lib/mois-csv.test.ts` | 31 | CSV 파싱 규칙 자체. 고정 입력 문자열을 쓰므로 원본이 바뀌어도 유효 |
| `src/lib/region-narrative.test.ts` | 8 | 서술이 고정 템플릿으로 수렴하지 않는지 |

집계 로직이나 파서를 건드렸으면 이 테스트를 먼저 돌린다. `npm run test`는 `build-data`를 선행하므로, 산출물만 검사하려면 `npx vitest run`을 쓴다.

## What This Is

행정안전부(MOIS) 주민등록 인구통계 기반의 서버 렌더링 모바일 대시보드. 부동산 매수·이주 의사결정 리서치가 목적 — 도메인 정의는 `docs/domain.md`. 런타임 외부 API 호출은 없고, 모든 인구 데이터는 사전 빌드된 JSON을 요청마다 디스크에서 읽는다.

## Data Flow

1. `data/raw/`에 MOIS 월간 CSV **2종**(각 8개 파일, 2023.01~2026.07 43개월)이 있다. 파일명은 MOIS 포털에서 받은 그대로(한글, `조회시작_조회끝_통계명_월간.csv`) 두며, 한 파일에 1~6개월이 들어 있다.
   - `*_주민등록인구및세대현황_월간.csv` — 인구·세대 (총인구·세대수·세대당인구·남자·여자)
   - `*_연령별인구현황_월간.csv` — 연령별 (10세 단위 11구간을 계/남/여로)

   진짜 이동자 통계(전입/전출)는 이 저장소에 없다. 상세의 "전입출" 탭은 인구·세대 CSV의 월별 순증감에서 계산한 근사값이다(→ `docs/principles.md` A3). 실제 이동자 통계는 KOSIS 국내인구이동통계를 별도로 들여와야 한다.
2. `scripts/csv-to-json.ts`(`npm run build-data`)가 시군구별 `public/data/regions/{code}.json`과 전체 목록 `index.json`을 생성
3. `src/lib/data.ts`가 요청 시점에 `fs.readFileSync`로 읽고 집계(`getRegionDetail`, `getAllRegionRankings`, `getSidoStats` 등). 프로세스 메모리 캐시는 `index.json`과 일부 파생 결과뿐
4. 데이터 페이지(`ranking`, `compare`, `[sido]/[sigungu]`, `.../detail`)는 async Server Component로 `await props.searchParams`(Next.js 16 패턴) 후 `data.ts`를 직접 호출 — **데이터용 API 라우트 없음**. 유일한 라우트 `src/app/api/og/route.tsx`는 OG 이미지 생성용
5. 필터 상태(월·정렬·선택 지역·비교 범위)는 전부 URL 쿼리 파라미터(`nuqs` / searchParams)

생성된 JSON은 git에 커밋된다. `build-data`가 매번 출력 디렉터리를 비우고 다시 쓰므로, 행정구역 개편으로 사라진 코드의 JSON이 남지 않는다.

## ⚠️ 집계 단위 — 새 집계 함수를 쓰기 전에 반드시 읽을 것

`index.json`의 272개 엔트리는 동일한 행정 단위가 아니다. `Region.level`과 `Region.retiredAfter`가 이를 구분한다.

| 구분 | 개수 | 의미 |
|---|---|---|
| `level: 'sigungu'`, 현행 | 230 | 최상위 시군구. **합계·순위의 유일한 기준 집합** |
| `level: 'district'` | 39 | 일반구(예: `경기도 수원시 장안구`). 부모 시에 이미 포함되어 있다 |
| `retiredAfter` 있음 | 3 | 개편으로 폐지된 지역. 이력만 보유하며 최신월 데이터가 없다 |

**규칙 하나:** 전국·시도 **합계**와 **순위**는 반드시 `getTopLevelRegions()`를 쓴다. `getAllRegions()`는 검색·비교처럼 "지역을 고르는" 용도 전용이다.

필터링은 `data.ts`의 `getTopLevelRegions()` 한 곳에서만 정의한다. 각 함수가 개별로 거르기 시작하면 반드시 어긋난다 — 실제로 이 혼재 때문에 홈 전국 총인구가 20.6% 부풀려져 있었다(2026-08-10 해소, `docs/spec.md` D1).

**검증 기준값은 원본 CSV의 시도 합계 행이다.** 두 CSV 모두 코드가 `00000000`으로 끝나는 **17개 시도 합계 행**(예: `서울특별시  (1100000000)`)을 포함한다. 파서는 이 행을 지역 목록에서 제외하지만, MOIS가 직접 집계한 값이므로 **우리가 시군구를 더한 값과 대조하면 독립 검증이 된다.** 집계 로직을 바꿨으면 이 대조를 먼저 한다 — D1의 이중 계상은 이 한 번으로 잡혔을 문제다.

일반구는 삭제하지 않는다. KOSIS가 시도에서 멈추므로 분당구·영통구 해상도가 이 서비스의 차별점이다(`docs/principles.md` 0-2). 검색·비교·지역 상세에서는 1급 지역이고, 부모 시 상세의 "구별 현황" 섹션(`getChildDistricts()`)이 드릴다운 경로다.

## Region Code Hierarchy

10자리 MOIS 코드. `00000000`으로 끝나는 시도(17개) 행은 `csv-to-json.ts`가 제외하고 그 아래 단위만 남긴다. 앞 2자리가 시도 prefix.

- **세종특별자치시**는 하위 시군구가 없어 접두사 제거 후 `sigungu`가 빈 문자열이 된다. 빌드 시 시도명으로 채워 `/세종특별자치시/세종특별자치시`로 접근한다.
- **일반구 판별**은 두 조건을 모두 만족할 때만이다 — ① 부모 코드(앞 4자리 + `000000`)가 목록에 존재하고 ② 자기 이름이 `<부모명> `으로 시작. ①만 쓰면 영동군(`4374000000`)과 증평군(`4374500000`)처럼 코드 앞자리만 우연히 겹치는 별개 지역을 잘못 묶는다.

### 개편에는 두 종류가 있고 처리가 다르다

**① 통합·개칭 (N:1 또는 1:1) → `LEGACY_CODE_MAP`으로 병합**해 시계열을 잇는다.

| 개편 | 시점 |
|---|---|
| 강원도 → 강원특별자치도 (42xx→51xx) | 2023.06 |
| 군위군 경북 → 대구 (`4772000000`→`2772000000`) | 2023.07 |
| 전라북도 → 전북특별자치도 (45xx→52xx) | 2024.01 |
| **광주광역시 + 전라남도 → 전남광주통합특별시** (29xx·46xx→12xx, 시군구 27개 1:1) | **2026.07** |

> **부모 시를 옮기면 그 일반구도 함께 옮겨야 한다.** 전주시만 매핑하고 완산구·덕진구를 빠뜨리면, 계층 판별이 부모 코드 조회에 의존하므로 일반구가 부모를 잃고 최상위 시군구로 잘못 승격된다.

**② 분할 (1:N) → 병합 불가. `SPLIT_SUCCESSORS`에 승계 관계만 기록**한다.

인천 2026.07 개편(중구+동구→제물포구+영종구, 서구→서해구+검단구)이 여기 해당한다. 과거 인구를 신 지역에 배분할 근거가 없으므로 만들지 않는다(`principles.md` A3). 구 지역은 `retiredAfter`가 붙어 이력만 보존되고, 지역 페이지가 폐지 사실과 승계 지역을 안내한다.

**새 개편이 공표되면 매핑 추가가 데이터 갱신 절차의 일부다.** 빌드가 세 가지로 알려준다 — 알 수 없는 시도 prefix면 **중단**, 최신월 데이터가 없는 미선언 지역이 있으면 **경고**, 현행 최상위 시군구가 기대값(230)과 다르면 **경고**. 무시하지 말 것.

## CSV Parsing

빌드/개발 시점에만 실행되고 런타임에는 돌지 않는다. 세 파일로 나뉘어 있다.

| 파일 | 역할 |
|---|---|
| `scripts/lib/mois-csv.ts` | 순수 파싱 함수. 파일 시스템을 모른다 → 단위 테스트 대상 |
| `scripts/lib/region-codes.ts` | 시도 prefix, 개편 매핑(`LEGACY_CODE_MAP`·`SPLIT_SUCCESSORS`) |
| `scripts/csv-to-json.ts` | 파일 읽기·병합·계층 판별·JSON 쓰기 |
| `scripts/check-raw.ts` | 원본 검사(`npm run check-raw`) |

### 원본 형식

```
"행정구역","2026년07월_거주자 인구수","2026년07월_세대수",...   ← 1행이 헤더 전부
"서울특별시  (1100000000)","9,218,911","4,476,667",...        ← 2행부터 데이터
```

- **인코딩 CP949.** `decodeCSV()`가 BOM·치환 문자로 UTF-8과 자동 판별한다
- **지역 코드가 이름 안에 있다** — `parseRegionCell()`이 `이름 (0000000000)`에서 뽑는다
- **월과 항목이 한 컬럼명에 결합** — `2026년07월_세대수`
- 연령별은 월당 39컬럼 = (총인구수 + 연령구간인구수 + 11구간) × 계/남/여

### 고칠 때 지킬 것

- **컬럼은 이름으로 찾는다.** 위치 오프셋(`cols[b+15]`)을 쓰면 헤더가 한 칸 움직였을 때 예외 없이 조용히 다른 값을 읽는다. 지금은 월 개수·연령 구간 폭이 달라져도 동작한다(5세 단위 원본도 같은 9버킷으로 접힌다)
- **읽은 파일이 0개면 출력 디렉터리를 비우기 전에 실패한다.** 이 순서가 뒤집혀 있어서 D14가 "형식 불일치"가 아니라 "데이터 소실 위험"이 됐다
- **빈 셀은 0이 아니라 결측이다.** 개편월에는 구 코드 행과 신 코드 행이 한 파일에 함께 나오며 서로 겹치지 않는 달을 채운다. 빈칸을 0으로 읽으면 이 구조가 무너진다
- **연령 구간이 불완전하면 빌드를 세운다.** 2026-08에 `0~9세`만 담긴 파일이 조용히 들어온 적이 있다(`principles.md` A2)

연령 원본은 10세 단위 11구간이고 파서가 9버킷으로 재집계한다(`80+` = 80~89 + 90~99 + 100+). 5세 단위 전환은 보류 확정 → `principles.md` A2.

우리 합계가 MOIS 공식 *총인구*보다 낮은 것은 정상이다 — 원본이 `거주자 인구수`(거주불명자·재외국민 제외) 기준이다. **시도 합계 행과는 정확히 일치해야 한다.**

## Key Architecture Decisions

- **데이터 API 라우트 없음** — 집계는 Server Component 안에서 `src/lib/data.ts`의 `fs` 직접 읽기로 처리. `api/og`만 예외(OG 이미지)
- **URL 상태(`nuqs`/searchParams)** — React state나 Context를 쓰지 않는다. 필터가 새로고침·공유에 살아남는다
- **라이트·모바일 전용 UI** — 다크 모드·데스크톱 레이아웃 없음(의도된 결정). 최대 폭 430px(`--max-w`), `MobileShell` 래퍼. 디자인 토큰은 `src/app/globals.css`의 `@theme`
- **하단 네비게이션** — `BottomNav` 4탭: 홈 / 지도 / 순위(트렌딩 포함) / 비교
- **AdSense 운영 중** — `src/components/AdSlot.tsx`가 광고 유닛과 `adsbygoogle.js` 스크립트를 **함께** 렌더한다. 퍼블리셔 ID(`ca-pub-4466379680692265`)는 실 승인 ID로 컴포넌트와 `public/ads.txt`에 하드코딩. 슬롯 ID만 `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` 환경변수. `slot`이 비었거나 `enabled={false}`면 `null`을 반환해 광고 유닛도 스크립트도 렌더하지 않는다
- **`adsbygoogle.js`를 루트 레이아웃에 넣지 말 것.** 전역 로드 시 자동 광고(Auto Ads)가 지도·비교 빈 상태·지역 상세처럼 콘텐츠가 얇은 화면에도 광고를 삽입해 "게시자 콘텐츠가 없는 화면" 위반이 재발한다. 스크립트를 `AdSlot` 안에 둠으로써 **대시보드에서 자동 광고가 켜져 있어도 다른 화면에는 삽입될 수 없다**. 광고가 존재하는 페이지는 홈·`/ranking`·`/trending` 뿐이다

## 환경변수

| 변수 | 용도 | 미설정 시 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical·OG·sitemap·robots URL | `src/lib/site.ts`의 실제 도메인으로 폴백. 후행 슬래시는 자동 제거되니 값에 붙어 있어도 무방 |
| `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` | 광고 슬롯 ID | `AdSlot`이 `null` 반환(광고 미노출) |
| `NEXT_GOOGLE_SITE_VERIFICATION` | Search Console 인증 | 메타 태그 생략 |

## Docs

- `docs/domain.md` — 도메인 정의, KOSIS 대비 포지셔닝, 신규 기능 판단 기준 5단계. 새 기능을 제안하기 전에 확인
- `docs/principles.md` — 원리·원칙. **§0 제품 원칙(지표를 늘리지 않고 판단을 준다 / 시군구가 유일한 차별점)이 다른 모든 원칙보다 우선**
- `docs/spec.md` — 살아있는 기능 명세(페이지·컴포넌트·데이터 함수) + §5 알려진 결함 D1~D15
- `docs/backlog.md` — P0~P3 우선순위, 신규 서비스 후보
- `docs/benchmark-kosis.md` — 통계청 KOSIS 대비 벤치마킹 결론

**한 줄 요약:** 이 서비스는 통계를 더 많이 보여주는 방향이 아니라, 같은 통계에서 더 분명한 **판단**을 뽑는 방향으로 간다. 지표 추가 제안은 `domain.md` §7 필터를 먼저 통과시킬 것.

## Path Aliases

`@/*` → `./src/*` (`tsconfig.json`, `vitest.config.mjs`에 동일 설정)
