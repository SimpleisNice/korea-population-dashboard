# 서비스 기능 명세

> 최종 업데이트: 2026-08-09
> 대상: main 브랜치 `f3b2b13` 기준 코드 실사 결과

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [페이지 명세](#2-페이지-명세)
3. [공통 컴포넌트](#3-공통-컴포넌트)
4. [데이터 레이어](#4-데이터-레이어)
5. [알려진 결함](#5-알려진-결함)

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 인구통계 (대한민국 주민등록 인구 통계 대시보드) |
| URL | https://korea-population-dashboard.vercel.app |
| 타깃 사용자 | 부동산 구매·투자 검토자, 이주 지역 리서치 사용자 |
| 데이터 출처 | 행정안전부(MOIS) 주민등록 인구통계 |
| 데이터 범위 | 인구·세대 40개월(2023.01~2026.04), 연령별 39개월(2023.01~2026.03) |
| 집계 단위 | `index.json` 280개 = 최상위 시군구 230 + 일반구 39 + 출장소 11(데이터 없음) → **§5 참조** |
| 갱신 주기 | 월 1회 수동 (`data/raw/`에 CSV 추가 후 `npm run build-data`) |
| 렌더링 | Server Component 기본, 인터랙션 요소만 Client Component |
| UI | 라이트 미니멀, 모바일 전용(`max-width: 430px`), 다크 모드 없음 |
| URL 상태 | nuqs / Next.js 16 async `searchParams` |
| 수익화 | Google AdSense — 홈·순위·트렌딩 3개 페이지 하단만 |

---

## 2. 페이지 명세

### 2-1. 홈 `/`

**목적:** 진입점. 지역 검색과 주요 지역 빠른 접근.

**URL 파라미터:** 없음

| 영역 (위→아래) | 기능 |
|------|------|
| 로고·서브타이틀 | 서비스명 + 한 줄 소개 |
| 지역 검색창 | 시군구 퍼지 검색(Fuse.js) → 지역 요약 이동 |
| 전국 총괄 현황 | 전국 총인구·전월 대비 증감·기준 연월. 하단에 `/trending`("기간별 트렌드")·`/ranking`("지역 순위") 칩 |
| 인기 지역 탭 | 급증 / 급감 / 고령화 3탭. 탭별 TOP 6(시도별 1개, 최근 12개월 고정), 증감률 뱃지 |
| 관심 지역 | localStorage 즐겨찾기 (최대 10개) |
| 최근 본 지역 | localStorage 방문 이력 |
| 광고 | `AdSlot` |
| Footer | |

**컴포넌트:** `HomePageClient`, `RegionSearch`, `NationalSummary`, `PopularRegions`, `FavoriteRegions`, `RecentRegions`, `AdSlot`, `Footer`

---

### 2-2. 지역 요약 `/[sido]/[sigungu]`

**목적:** 시군구 핵심 지표 한눈에.

**URL 파라미터:** `ym`(YYYYMM, 기본 최신월), `cmp`(비교 대상 지역코드 — 헤더 비교 링크 프리셋용)

| 영역 | 기능 |
|------|------|
| 헤더 | 뒤로가기 / 검색 / 공유 / 즐겨찾기 / 비교 이동 |
| 기준월 선택기 | `MonthPicker` (URL `ym`) |
| 기준 정보 | 시도명 · 기준월 · 시도 내 순위 · 전국 순위 뱃지 |
| 핵심 지표 카드 ×2 | 총인구 / 세대수 — MoM + YoY 동시 표시, count-up |
| 부가 지표 카드 | 세대당 인구 / 성비(`SexRatioCard`) |
| 통계 요약 | 전월·전년비·순위를 pill로 요약 (`RegionInsight`) |
| 지역 분석 | 인구 규모·1년 추세·가구 구성·성비를 수치에서 생성한 서술 3문단 (`RegionAnalysis`) |
| 인구 추이 | **전년 동기 3개월 막대 비교**(`YoYBarChart`) — 라인 차트가 아님 |
| 시점 비교 | 현재 월 vs 과거 특정 월 (Server Action fetch, `TimePeriodCompare`) |
| 상세보기 링크 | `/detail` 이동 |

> 광고·Footer 없음. 라인 추이 차트와 기간 토글은 이 페이지가 아니라 상세 페이지에 있다.

**메타데이터:** 지역별 title/description/keywords, canonical, OG·Twitter 카드(`/api/og` 동적 이미지).

**컴포넌트:** `StatCard`, `SexRatioCard`, `YoYBarChart`, `MonthPicker`, `TimePeriodCompare`, `BookmarkButton`, `ShareButton`, `FadeIn`

---

### 2-3. 지역 상세 `/[sido]/[sigungu]/detail`

**목적:** 추이·세대·연령·증감·전입출 심층 제공.

**URL 파라미터:** `ym`(YYYYMM, 기본 최신월)

서버는 `getRegionDetail(code, ym, 0)`으로 **전체 기간**을 넘기고, 기간 축소는 `DetailTabs` 내부 상태(6/12/전체)로 처리한다. 기간 토글은 URL에 반영되지 않는다.

| 탭 | 내용 |
|----|------|
| 인구추이 | 기간 토글 + 라인 차트(`TrendChart`) + 향후 6개월 선형회귀 예측 점선 + 최근 6개월 테이블 |
| 세대 | 세대수·세대당 인구 카드 + 세대 인사이트 문단 + 세대수 추이 차트 |
| 연령 | 심층 지표 카드 4개(`AgeInsightCards`) + 두 시점 연령 분포 오버레이(`AgeCompareTab` → `AgeChart`) |
| 증감 | 기간 요약 카드 3개(순증감·증가한 달·감소한 달) + 월별 증감 막대(`ChangeChart`) |
| 전입출 | 순이동 인사이트 + 월별 순이동 막대 + 누적 순이동 area (`MigrationTab`) — **인구·세대 CSV의 월별 순증감을 이용한 근사값**, 전입출 원본 CSV 미사용 |

**연령 지표 계산 (10세 버킷 근사, 공식 통계 정의와 다름):**

| 지표 | 계산식 | 공식 정의와의 차이 |
|------|--------|---|
| 고령화 지수 | 60세+ ÷ 0~19세 × 100 | 통계청 정의는 65세+ ÷ 0~14세 |
| 생산가능 비율 | 20~59세 ÷ 총인구 × 100 | 통계청 정의는 15~64세 |
| 성비 | 남 ÷ 여 × 100 | 동일 |
| 중위 연령대 | 누적 50% 지점의 연령 구간 | 중위연령(단일 값)이 아닌 구간 |

원본 CSV는 5세 단위지만 파이프라인이 10세 버킷으로 재집계하므로 65/15세 경계를 만들 수 없다. 툴팁에 "10세 단위 근사"로 고지되어 있다.

**컴포넌트:** `DetailTabs`, `TrendChart`, `ChangeChart`, `MigrationTab`, `AgeChart`, `AgeCompareTab`, `AgeInsightCards`, `StatCard`, `MonthPicker`

---

### 2-4. 지역 비교 `/compare`

**목적:** 두 시군구를 나란히 비교.

**URL 파라미터:** `region_a`, `region_b`(10자리 코드), `ym`

| 영역 | 내용 |
|------|------|
| 페이지 설명 | 에디토리얼 안내 |
| 기준월 선택기 | `MonthPicker` — 변경 시 양쪽 재fetch(Server Action) |
| 지역 검색 A/B | `CompareSearch` — 선택·해제 시 URL 자동 갱신 |
| 비교 지표 테이블 | 8개 지표 (A=파랑, B=보라) |
| 추이 오버레이 | 두 지역 월별 인구 라인 |
| 연령 구조 비교 | `AgeStructureCompareChart` — 연령대 합계 구성비(%)를 A/B 막대로 비교 |
| 로딩 | `ResultSkeleton` |
| Footer | |

**비교 지표 8개:** 총인구 · 세대수 · 세대당 인구 · 남자 인구 · 여자 인구 · 성비 · 전년 동월 증감률 · 고령 인구 비율(60세+ ÷ 총인구 × 100)

> 광고 없음. (`AdSlot`은 이 페이지에서 제거됨)

**컴포넌트:** `CompareClient`, `CompareSearch`, `AgeStructureCompareChart`, `MonthPicker`, `Skeleton`, `Footer`

---

### 2-5. 지역 순위 `/ranking`

**목적:** 전국 시군구를 지표별로 순위 조회.

**URL 파라미터:** `sort`(`population`|`popChange`|`popChangeRate`|`households`, 기본 `population`), `sido`(시도명)

| 항목 | 내용 |
|------|------|
| 페이지 설명 | 상단 에디토리얼 |
| 기준 연월 | `RankingHeader` — 기준월 + 트렌딩 바로가기 |
| 정렬 4종 | 총인구 / 전월 증감 / 전년 증감률 / 세대수 |
| 시도 필터 | 전체 + 17개 시도. 가로 스크롤 칩, 우측 페이드 힌트 |
| 순위 리스트 | 순위(TOP 3 메달) · 지역명 · 지표값 · 증감 방향 |
| 광고 | 리스트 하단 `AdSlot` |
| 해설 + Footer | "인구 순위 활용 가이드" |

> 기준월은 항상 최신월 고정 — 이 페이지에는 `MonthPicker`가 없다.

**컴포넌트:** `RankingClient`, `RankingHeader`(동일 파일 export), `AdSlot`, `Footer`

---

### 2-6. 인구 트렌딩 `/trending`

**목적:** 최근 인구 변화가 큰 지역 탐색. `BottomNav`에는 `/ranking`과 통합되어 별도 탭이 없다.

**URL 파라미터:** 없음 (기간은 클라이언트 상태)

| 항목 | 내용 |
|------|------|
| 기간 선택 | 3 / 6 / 12개월 세그먼트 (서버가 3종 모두 미리 계산해 전달) |
| 급증 TOP 10 | 기간 내 인구 증가 상위 |
| 급감 TOP 10 | 기간 내 인구 감소 상위 |
| 표시 항목 | 지역명 · 변화 인원 · 변화율 · 방향 |
| 순위 바로가기 | 헤더 우측 → `/ranking` |
| 광고 + 해설 + Footer | "인구 트렌드 읽는 법" |

**컴포넌트:** `TrendingClient`, `AdSlot`, `Footer`

---

### 2-7. 인구 지도 `/map`

**목적:** 17개 시도 인구 증감을 SVG choropleth로 시각화.

| 항목 | 내용 |
|------|------|
| 페이지 설명 | 색상 스케일 안내 |
| 히트맵 | `@svg-maps/south-korea` + `d3-scale`. 파랑=증가, 빨강=감소 |
| 시도 클릭 | 해당 시도 총인구 + 변화율 표시 |
| 해설 + Footer | "인구 이동의 큰 그림" |

> 페이지 상단 설명문은 "전월 대비"라고 쓰여 있으나 `getSidoStats()`와 `KoreaHeatmap` 범례는 **전년 동월 대비**를 쓴다 → §5 참조.

**데이터:** `getSidoStats()`

---

### 2-8~2-10. 정적 콘텐츠 페이지

| 경로 | 내용 |
|---|---|
| `/about` | 서비스 개요, 주요 기능 4가지 카드, 데이터 출처, 면책 조항 |
| `/privacy` | 개인정보처리방침 (시행일 2026-06-30). 회원가입 없음, 자동 수집 항목·AdSense 제3자 제공·쿠키 고지 |
| `/methodology` | 데이터 출처·갱신 주기, 집계 단위, 행정경계 변경 처리, 지표 정의, 해석 가이드 |

> `/about`·`/methodology`가 "전국 226개 시군구"라고 명시하나 실제 집계 대상은 다르다 → §5 참조.

---

## 3. 공통 컴포넌트

### 레이아웃 (`src/components/layout/`)

| 컴포넌트 | 설명 |
|---------|------|
| `MobileShell` | 최대 폭 430px + 하단 네비 여백 래퍼 |
| `Header` | sticky 상단바. `title`, `showBack`, `backHref`, `showSearch`, `right` |
| `BottomNav` | 홈 / 지도 / 순위(트렌딩 포함) / 비교. frosted-glass + 스프링 애니메이션 |
| `Footer` | 서비스 소개·개인정보처리방침·방법론 링크, 데이터 출처 |

### 지역 (`src/components/region/`)

| 컴포넌트 | 설명 |
|---------|------|
| `StatCard` | 지표 카드. `value`, `change`(MoM), `yoyChange`(YoY), `unit`, `small`, `toFixed`. count-up |
| `SexRatioCard` | 남녀 성비 바 |
| `TrendChart` | Recharts 그라디언트 라인. `forecast` 오버레이 지원. Y축은 0 고정이 아니라 최소·최댓값 ±15% 동적 범위 |
| `YoYBarChart` | 전년 동기 3개월 막대 비교 |
| `BookmarkButton` | localStorage 즐겨찾기 토글 |
| `ShareButton` | 공유 바텀시트 — URL 복사 / PNG 저장(html2canvas) |
| `TimePeriodCompare` | 두 시점 비교 (Client + Server Action) |

### UI (`src/components/ui/`)

| 컴포넌트 | 설명 |
|---------|------|
| `MonthPicker` | 기준 연월 드롭다운 (URL `ym`) |
| `AnimatedNumber` | count-up 숫자 |
| `FadeIn` | 진입 fade 래퍼 |
| `Skeleton` | shimmer 플레이스홀더 |
| `RangeToggle` | **미사용(dead code)** — `DetailTabs`가 동일 이름의 로컬 컴포넌트를 별도로 정의해 쓴다 |

### 광고 (`src/components/AdSlot.tsx`)

`slot`, `format`, `style`, `className`, `enabled`(기본 true). `slot`이 비었거나 `enabled=false`면 `null`을 반환해 광고 유닛을 렌더하지 않는다(빈 슬롯 노출로 인한 정책 위반 방지). 활성 시 `adsbygoogle.push()` 1회 + "광고" 라벨. 퍼블리셔 ID 하드코딩, 슬롯 ID는 `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`.

**배치:** 홈 · `/ranking` · `/trending` 콘텐츠 하단 3곳뿐.

**정책:** AdSense 대시보드에서 자동 광고(Auto Ads)를 반드시 OFF로 유지. `adsbygoogle.js`가 전 페이지에 로드되므로 자동 광고는 얇은 화면(지도·비교 빈 상태)에 광고를 자동 삽입해 "게시자 콘텐츠가 없는 화면" 위반을 재발시킨다.

---

## 4. 데이터 레이어

### 흐름

```
MOIS CSV (data/raw/, 3종 중 2종만 파싱)
  → scripts/csv-to-json.ts  (npm run build-data — dev/build 전 자동)
  → public/data/regions/{code}.json + index.json   (git 커밋됨)
  → src/lib/data.ts  (요청 시 fs.readFileSync)
  → Server Component / Server Action
  → Client Component (props)
```

런타임에 CSV를 파싱하지 않는다. 원본 CSV는 `data/raw/`에만 있고 `public/`에는 없다.

### CSV 파싱 (`scripts/csv-to-json.ts`)

- **인구·세대 CSV**: 1행 메타, 2행 월 헤더(반복), 3행 컬럼 타입, **4행부터** 데이터. 월당 5컬럼
- **연령별 CSV**: 앞 3행 동일, **5행부터** 데이터. 5세 단위 원본 → 10세 단위 9버킷 재집계
- `splitCSVLine()`이 따옴표 안 콤마 처리, `parseNum()`이 콤마 제거
- `LEGACY_CODE_MAP`: 강원(42xx→51xx, 2023.06)·전북(45xx→52xx, 2024.01) 병합으로 시계열 연속성 유지. **군위군(2023.07 경북→대구, 4772000000→2772000000)은 누락 → D12**
- **미사용 CSV**: `*_other_population_change_monthly.csv`는 `data/raw/`에 있지만 파싱하지 않는다. 이름과 달리 **전입·전출 데이터가 아니고** 월별 `전월인구수 / 당월인구수 / 인구증감`을 남·여·계로 나눈 파일이다. 추가로 얻을 수 있는 정보는 **증감의 성별 분해**뿐이며, 진짜 이동자 통계는 이 저장소에 없다. 단 **전국·시도 합계 행이 포함되어 있어 집계 검증 기준값으로 유용하다**(2026.04 전국 51,097,986명)

### 주요 함수 (`src/lib/data.ts`)

| 함수 | 반환 | 설명 | 집계 대상 |
|------|----------|------|---|
| `getAllRegions()` | `Region[]` | 전체 목록 (index.json) | 280 (혼합) |
| `getAvailableMonths()` | `string[]` | 연월 목록 — **index 첫 지역의 월 키만 사용** | — |
| `getMonthStats(code, ym)` | `MonthlyStats \| null` | 단일 월 통계 | — |
| `getRegionDetail(code, ym?, range=12)` | `RegionDetail \| null` | 추이·연령·YoY. `range=0`이면 전체 기간 | 단일 |
| `getRegionBySlug(sido, sigungu)` | `Region \| null` | URL slug 조회 | — |
| `getRegionRank(code, ym)` | `RegionRank \| null` | 시도 내 + 전국 순위 | 280 (혼합) |
| `getAllRegionRankings(ym)` | `RegionRankEntry[]` | 순위 리스트 (데이터 없는 11개 제외 → 269행) | 269 (혼합) |
| `getPopularRegions()` | `{code, rate}[]` | 12개월 증가율 TOP 6, 시도별 1개 | 혼합 |
| `getDecliningRegions()` | `{code, rate}[]` | 12개월 감소율 TOP 6, 시도별 1개 | 혼합 |
| `getAgingRegions()` | `{code, rate}[]` | 고령화 지수 TOP 6, 시도별 1개 | 혼합 |
| `getPopulationTrends(3\|6\|12)` | `{gainers, losers}` | 급증·급감 TOP 10 | 혼합 |
| `getNationalSummary()` | `NationalSummary \| null` | 전국 총인구 + 전월 증감 | **혼합 — 이중 계상** |
| `getSidoStats()` | `SidoStat[]` | 시도별 인구 + **전년 동월 대비** 변화율 | **혼합 — 이중 계상** |
| `getAgeGroups(code, ym)` | `AgeGroup[] \| null` | 연령 분포 (10세 단위) | 단일 |

**캐싱:** `indexCache`, `popularCache`, `decliningCache`, `agingCache`, `sidoStatsCache`, `nationalSummaryCache`(단일 값), `rankCache`/`trendCache`(Map). 모두 프로세스 메모리이며 무효화 경로가 없다 — 데이터가 빌드 산출물이므로 정상 동작이지만, 지역별 JSON은 요청마다 다시 읽는다.

### 타입 (`src/lib/types.ts`)

```ts
Region          { code, sido, sigungu }
MonthlyStats    { year, month, population, households, householdSize, male, female }
RegionDetail    { region, latest, prevMonth, yoyMonth, trend, ageGroups }
RegionRank      { nationalRank, nationalTotal, sidoRank, sidoTotal }
AgeGroup        { label, male, female }        // label 예: "30–39" (en dash)
TrendPoint      { label, population, households, change, householdsChange }
TrendEntry      { region, startPop, endPop, change, changeRate }
NationalSummary { totalPopulation, prevMonthChange, month }
CompareData     { a: RegionDetail, b: RegionDetail }   // 미사용
SidoStat        { sido, population, changeRate }        // data.ts에 정의
```

### Server Actions (`src/lib/actions.ts`)

| 함수 | 호출처 |
|------|------|
| `fetchRegionDetail(code, ym?)` | 비교 페이지 지역/월 변경 |
| `fetchMonthStats(code, ym)` | 시점 비교 |
| `fetchAgeGroups(code, ym)` | 연령 탭 비교 시점 변경 |

### 유틸

- `src/lib/favorites.ts` — localStorage 즐겨찾기 CRUD
- `src/lib/chart-utils.ts` — 차트 애니메이션 상수
- `src/lib/utils.ts` — `cn`, `formatNumber`, `formatCompact`, `formatChange`, `formatYM`, `regionPath`, `buildForecast`(단순 선형회귀)

### 테스트

테스트 파일 없음. `package.json`에 `test` 스크립트도 없다 — `npx vitest run`으로 직접 실행. `vitest.config.mjs`만 설정되어 있다.

---

## 5. 알려진 결함

코드 실사(2026-08-09)로 확인된 항목. 상세 배경과 처리 순서는 `docs/backlog.md`.

| # | 결함 | 영향 | 확인 방법 |
|---|---|---|---|
| D1 | **일반구 이중 계상** — `index.json`에 `수원시`와 `수원시 장안구`가 함께 존재. 전국·시도 합계가 39개 일반구를 두 번 더한다 | 홈 전국 총인구 61,620,651명 vs MOIS 공식 51,097,986명 → **+20.6%**. 최상위 시군구만 더하면 50,879,765명(공식값과 0.43% 이내). 시도 지도 절대값도 동일하게 과다 | `curl localhost:3000 \| grep totalPopulation` → `61620651` |
| D2 | **순위표 단위 혼재** — 수원시(약 120만)와 수원시 장안구(약 30만)가 같은 순위표에서 경쟁 | 순위 신뢰도 저하 | `/ranking`에 수원시 장안구/권선구/팔달구/영통구 모두 노출 |
| D3 | **`nationalTotal` 불일치** — 280으로 보고하나 실제 렌더 행은 269 | "전국 N위 / 280" 표기 오류 | `/ranking` HTML `nationalTotal":280` |
| D4 | **세종특별자치시 도달 불가** — `sigungu: ''`라 `/세종특별자치시/`가 404 | 17개 시도 중 1개 상세 조회 불가, sitemap에 깨진 URL 포함 | HTTP 404 확인됨 |
| D5 | **출장소 11개 유령 엔트리** — index에 있으나 JSON 파일 없음(영종·용유·검단·송탄·안중·풍양·화성동부·동탄·남양·장유·웅상) | 홈 검색에서 선택 시 404 | HTTP 404 확인됨 |
| D6 | **문서상 시군구 수 오류** — `/about`·`/methodology`가 "226개"라고 명시. 실제 최상위 시군구는 230, 렌더 가능 엔트리는 269 | 사용자 대상 사실 오류 | 데이터 카운트 |
| D7 | **지도 설명문 오류** — `/map` 상단이 "전월 대비"라고 하나 실제 계산은 전년 동월 대비 | 지표 오해 | `getSidoStats()`가 `months[length-13]` 사용 |
| D8 | **레거시 JSON 34개 잔존** — `build-data`가 출력 디렉터리를 비우지 않아 강원 42xx·전북 45xx JSON이 커밋된 채 유지 | 저장소 오염, 향후 개편 때 반복 | `index.json`에 없는 파일 34개 |
| D9 | **`sitemap.ts`/`robots.ts` 폴백 불일치** — `NEXT_PUBLIC_SITE_URL` 미설정 시 `https://example.com` (지역 페이지는 vercel 도메인으로 폴백) | 환경변수 누락 시 SEO 파손 | 코드 |
| D10 | **`src/components/ui/RangeToggle.tsx` 미사용** — `DetailTabs`가 동명 로컬 컴포넌트를 별도 정의 | dead code | import 없음 |
| D11 | **`getAvailableMonths()`가 index 첫 지역에만 의존** — 종로구가 최신월을 갖지 못하면 전 서비스 기준월이 밀린다 | 잠재적 단일 장애점 | 코드 |
| D12 | **군위군 시계열 단절** — 2023.07 경북→대구 개편(4772000000→2772000000)이 `LEGACY_CODE_MAP`에 없다 | `경상북도 군위군`은 2023.01~06(6개월)에서 멈춘 유령 지역, `대구광역시 군위군`은 2023.07~(34개월)만 존재. 두 페이지 모두 3년치 추이가 잘려 보인다 | JSON 월 범위 |
| D13 | **정지된 데이터가 현재값처럼 노출** — 순위 함수가 `latestAvailable()`로 폴백해 최신월이 없는 지역에 과거 수치를 채운다 | 2026.04 순위표에 경북 군위군이 **2023.06 수치 23,139명**으로 등장. 기준월 표기와 실제 데이터 시점이 다르다 | `getAllRegionRankings` + D12 |
