# 서비스 기능 명세

> 최종 업데이트: 2026-08-19 (P1-5 탭 통합 · P1-8 lint 해소)
> 대상: `main` 브랜치 기준

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
| 데이터 범위 | **43개월 (2023.01~2026.07)**, 인구·세대·연령 동일. 2026-08-18 신 형식으로 전량 교체 |
| 집계 단위 | `index.json` 272개 = 현행 최상위 시군구 **230** + 일반구 **39** + 폐지 **3**. 합계·순위는 현행 최상위만 사용 |
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
| **폐지 안내** | `Region.retiredAfter`가 있을 때만 노출. 폐지 시점과 승계 지역 링크. 기준월은 그 지역의 마지막 달로 고정된다 |
| 기준월 선택기 | `MonthPicker` (URL `ym`) |
| 기준 정보 | 시도명 · 기준월 · 시도 내 순위 · 전국 순위 뱃지 |
| 핵심 지표 카드 ×2 | 총인구 / 세대수 — MoM + YoY 동시 표시, count-up |
| 부가 지표 카드 | 세대당 인구 / 성비(`SexRatioCard`) |
| **한 줄 판정** | 최상단. 인구 추세 + 연령 구조 + 세대 분화를 조합한 한 문장 결론 (`VerdictCard`, 7종 분기) |
| 통계 요약 | 전월·전년비·순위를 pill로 요약 (`RegionInsight`) |
| 지역 분석 | 규모·순위 / 1년 추세 / 연령 구성 해석 / 세대 분화 / 가구 구성·성비 — 수치에서 생성한 **5문단** (`buildRegionNarrative`). 신설 지역은 추세 문단 자리에 "아직 판단할 수 없다"는 사유를 넣는다 |
| 인구 추이 | **전년 동기 3개월 막대 비교**(`YoYBarChart`) — 라인 차트가 아님 |
| **구별 현황** | 일반구가 있는 시에만 노출. 구별 인구·전년비 리스트 → 해당 구 페이지로 드릴다운 (`getChildDistricts`) |
| 시점 비교 | 현재 월 vs 과거 특정 월 (Server Action fetch, `TimePeriodCompare`) |
| 상세보기 링크 | `/detail` 이동 |

> 광고·Footer 없음. 라인 추이 차트와 기간 토글은 이 페이지가 아니라 상세 페이지에 있다.

**메타데이터:** 지역별 title/description/keywords, canonical, OG·Twitter 카드(`/api/og` 동적 이미지).

**컴포넌트:** `StatCard`, `SexRatioCard`, `YoYBarChart`, `MonthPicker`, `TimePeriodCompare`, `BookmarkButton`, `ShareButton`, `FadeIn`

---

### 2-3. 지역 상세 `/[sido]/[sigungu]/detail`

**목적:** 추이·세대·연령·증감 심층 제공.

**URL 파라미터:** `ym`(YYYYMM, 기본 최신월)

서버는 `getRegionDetail(code, ym, 0)`으로 **전체 기간**을 넘기고, 기간 축소는 `DetailTabs` 내부 상태(6/12/전체)로 처리한다. 기간 토글은 URL에 반영되지 않는다.

| 탭 | 내용 |
|----|------|
| 인구추이 | 기간 토글 + 라인 차트(`TrendChart`) + 향후 6개월 선형회귀 예측 점선 + 최근 6개월 테이블 |
| 세대 | 세대수·세대당 인구 카드 + 세대 인사이트 문단 + 세대수 추이 차트 |
| 연령 | 심층 지표 카드 4개(`AgeInsightCards`) + 두 시점 연령 분포 오버레이(`AgeCompareTab` → `AgeChart`) |
| 증감 | 기간 요약 카드 3개(순증감·증가한 달·감소한 달) + 순증감 판정 한 줄(`NetChangeInsight`) + 월별 증감 막대(`ChangeChart`) + 누적 증감 area(`CumulativeChangeChart`) + 데이터 성격 고지 |

> **구 "전입출" 탭은 2026-08-19 증감 탭에 통합됐다 (P1-5).** 두 탭이 같은 `trend` 데이터로 같은 막대 차트를 두 번 그리고 있었고, "전입출"은 우리가 갖고 있지 않은 지표의 이름이었다. 탭 5개 → **4개**(`principles.md` A3·0-1).

**연령 지표 계산 (10세 버킷 근사, 공식 통계 정의와 다름):**

| 지표 | 계산식 | 공식 정의와의 차이 |
|------|--------|---|
| 고령화 지수 | 60세+ ÷ 0~19세 × 100 | 통계청 정의는 65세+ ÷ 0~14세 |
| 생산가능 비율 | 20~59세 ÷ 총인구 × 100 | 통계청 정의는 15~64세 |
| 성비 | 남 ÷ 여 × 100 | 동일 |
| 중위 연령대 | 누적 50% 지점의 연령 구간 | 중위연령(단일 값)이 아닌 구간 |

**10세 단위를 기준으로 확정했다 (2026-08-18).** 원본 CSV가 `0~9세` … `100세 이상` 11구간으로 제공되어 65/15세 경계를 만들 수 없다. 5세 단위 재다운로드를 시도했으나 MOIS 조회에서 구간 선택이 어긋나 파일이 조용히 망가졌고, 43개월 전 기간을 5세로 유지하는 운영 비용이 지표 정확도 이득보다 크다고 판단했다.

대신 **공식 지표명을 우리 근사치에 쓰지 않는다** — "노령화지수"가 아니라 "고령화 지수", "생산연령인구"가 아니라 "생산가능 비율". 같은 이름에 다른 계산식이 붙는 것이 가장 나쁜 상태다(`principles.md` A2). 툴팁에 "10세 단위 근사"로 고지되어 있다.

**컴포넌트:** `DetailTabs`, `TrendChart`, `ChangeChart`, `NetChangeTab`(`NetChangeInsight`·`CumulativeChangeChart`·`NetChangeDisclosure`), `AgeChart`, `AgeCompareTab`, `AgeInsightCards`, `StatCard`, `MonthPicker`

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

> 색상 기준은 **전년 동월 대비** 변화율이다(`getSidoStats()`가 13개월 전과 비교). 설명문·범례 모두 동일하게 표기한다.

**데이터:** `getSidoStats()`

---

### 2-8~2-10. 정적 콘텐츠 페이지

| 경로 | 내용 |
|---|---|
| `/about` | 서비스 개요, 주요 기능 4가지 카드, 데이터 출처, 면책 조항 |
| `/privacy` | 개인정보처리방침 (시행일 2026-06-30). 회원가입 없음, 자동 수집 항목·AdSense 제3자 제공·쿠키 고지 |
| `/methodology` | 데이터 출처·갱신 주기, 집계 단위, 행정경계 변경 처리, 지표 정의, 해석 가이드 |

> 지역 수는 `getTopLevelRegions().length`로 렌더한다. 하드코딩 "226개"는 2026-08-11 제거됨(D6 해소).

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

> `ui/RangeToggle.tsx`는 2026-08-11 삭제됨(dead code, D10 해소). 기간 토글은 `DetailTabs`의 로컬 컴포넌트뿐이다.

`AnimatedNumber`의 **초기 상태는 실제 값이어야 한다.** 0으로 시작하면 서버 HTML에 0이 박혀 크롤러가 지역 페이지 수치를 전부 "0.0만 명"으로 읽는다(2026-08-11 수정, `principles.md` B4).

### 광고 (`src/components/AdSlot.tsx`)

`slot`, `format`, `style`, `className`, `enabled`(기본 true). `slot`이 비었거나 `enabled=false`면 `null`을 반환해 광고 유닛도 스크립트도 렌더하지 않는다(빈 슬롯 노출로 인한 정책 위반 방지). 활성 시 `adsbygoogle.js` 로드 + `adsbygoogle.push()` 1회 + "광고" 라벨. 퍼블리셔 ID 하드코딩, 슬롯 ID는 `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`.

**배치:** 홈 · `/ranking` · `/trending` 콘텐츠 하단 3곳뿐.

**정책:** `adsbygoogle.js`는 `AdSlot` 안에서만 로드한다 — 2026-08-11에 루트 레이아웃에서 제거했다. 전역 로드 시 자동 광고(Auto Ads)가 얇은 화면(지도·비교 빈 상태·지역 상세)에 광고를 삽입해 "게시자 콘텐츠가 없는 화면" 위반이 재발한다. 스크립트를 `AdSlot` 안에 두면 **대시보드 설정과 무관하게 구조적으로 차단된다.** 대시보드의 자동 광고 OFF는 이중 방어로만 의미가 있다.

---

## 4. 데이터 레이어

### 흐름

```
MOIS CSV (data/raw/, 2종 — 인구·세대 / 연령별)
  → npm run check-raw       (선택. 파일을 넣은 직후, 빌드 전에)
  → scripts/csv-to-json.ts  (npm run build-data — dev/build/test 전 자동)
  → public/data/regions/{code}.json + index.json   (git 커밋됨)
  → src/lib/data.ts  (요청 시 fs.readFileSync)
  → Server Component / Server Action
  → Client Component (props)
```

런타임에 CSV를 파싱하지 않는다. 원본 CSV는 `data/raw/`에만 있고 `public/`에는 없다. **따라서 원천 CSV가 바뀌어도 배포된 서비스는 영향을 받지 않는다** — 깨지는 지점은 빌드다.

### 원천 CSV 형식 (2026-08-18 교체)

MOIS 포털 다운로드 형식이 바뀌었고, `data/raw`를 신 형식 16개 파일로 전량 교체했다. 파일명은 받은 그대로 유지한다(`202601_202606_주민등록인구및세대현황_월간.csv`).

| | 구 형식 (git 이력) | 신 형식 (현재) |
|---|---|---|
| 인코딩 | UTF-8 + BOM | **CP949** |
| 헤더 깊이 | 3행(인구) / 4행(연령) | **1행 (양쪽 동일)** |
| 데이터 시작 | 4행 / 5행 | **2행** |
| 지역 코드 | 컬럼 0 `행정기관코드` | **이름에 결합** — `서울특별시  (1100000000)` |
| 월·항목 | 별도 행에 `2026년01월` | **컬럼명에 결합** — `2026년07월_세대수` |
| 인구 지표명 | `총 거주자수` | `거주자 인구수` — **같은 값** |
| 연령 구간 | 10세 11구간 | 10세 11구간 — **동일** |

**시계열이 어긋나지 않는 근거:** 지표 정의가 같다(양쪽 다 거주자 기준). 우리 합계가 MOIS 공식 *총인구*보다 낮은 것은 거주불명자·재외국민 제외 때문이며 정상이다. **시도 합계 행과는 정확히 일치한다** — 2026.07 기준 50,871,820명으로 오차 0.000%.

### CSV 파싱 (2026-08-18 재작성)

파서는 순수 모듈로 분리되어 단위 테스트 대상이 된다(P1-7 해소).

| 파일 | 역할 |
|---|---|
| `scripts/lib/mois-csv.ts` | 인코딩 판별·행 분해·헤더 파싱·연령 재집계. 파일 시스템을 모른다 |
| `scripts/lib/region-codes.ts` | `SIDO_BY_PREFIX`·`LEGACY_CODE_MAP`·`SPLIT_SUCCESSORS` |
| `scripts/csv-to-json.ts` | 파일 읽기·병합·계층 판별·폐지 판별·JSON 쓰기 |
| `scripts/check-raw.ts` | 원본 검사 (`npm run check-raw`) |

**설계 규칙**

- **컬럼은 이름으로 찾는다.** 위치 오프셋을 쓰지 않으므로 월 개수·연령 구간 폭이 달라져도 동작한다. 5세 단위 원본도 같은 9버킷으로 접힌다
- **빈 셀은 결측이지 0이 아니다.** 개편월에는 구·신 코드가 한 파일에 함께 나오며 서로 겹치지 않는 달을 채운다
- **연령 원본 11구간 → 9버킷** (`80+` = 80~89 + 90~99 + 100+). 구간 하한으로 버킷을 정한다
- **시도 행(`00000000`)은 지역 목록에서 제외하되 검증 기준값으로 합산**한다(`principles.md` A3-1)
- **읍면동(뒤 5자리 ≠ `00000`)은 배제**한다. 섞여 들어오면 상위 단위와 이중 계상된다

**빌드를 세우는 조건 (경고가 아니라 중단)**

| 조건 | 이유 |
|---|---|
| 읽은 CSV가 0개 | 출력 디렉터리를 비우기 **전에** 실패한다. 이 순서가 D14의 실질적 위험이었다 |
| 알 수 없는 시도 prefix | 개편 미반영 시 해당 시도가 통째로 누락된다 |
| 연령 구간 불완전 | `0~9세`만 담긴 파일이 조용히 통과한 적이 있다 |

**경고만 하는 조건:** 최신월 데이터가 없는 미선언 지역, 현행 최상위 시군구 수 ≠ `EXPECTED_ACTIVE_TOP_LEVEL`(230).

### 행정구역 개편 처리

개편은 두 종류이고 처리가 다르다.

**① 통합·개칭 → `LEGACY_CODE_MAP`으로 병합** (시계열 연속)

| 개편 | 시점 | 매핑 수 |
|---|---|---|
| 강원도 → 강원특별자치도 (42xx→51xx) | 2023.06 | 18 |
| 군위군 경북 → 대구 | 2023.07 | 1 |
| 전라북도 → 전북특별자치도 (45xx→52xx) | 2024.01 | 16 (일반구 2 포함) |
| **광주광역시 + 전라남도 → 전남광주통합특별시** (29xx·46xx→12xx) | **2026.07** | 27 |

> 부모 시를 옮기면 **그 일반구도 함께** 옮겨야 한다. 전주시 완산구·덕진구를 빠뜨리면 계층 판별이 부모를 못 찾아 일반구가 최상위로 잘못 승격된다(실제로 발생, 230이 232가 됨).

**② 분할 → 병합 불가. `SPLIT_SUCCESSORS`에 승계 관계만 기록**

인천 2026.07 개편(중구+동구→제물포구+영종구, 서구→서해구+검단구)이 해당한다. 과거 인구를 신 지역에 배분할 근거가 없어 만들지 않는다(`principles.md` A3).

| 결과 | 처리 |
|---|---|
| 구 지역 3개 | `retiredAfter: '202606'` + `successorCodes`. 이력 조회 가능, 최신월 순위·합계에서 자동 제외 |
| 신 지역 4개 | 202607 1개월치만 보유. 서술이 "아직 추세를 판단할 수 없다"고 명시 |
| 현행 최상위 시군구 | 229 → **230** (3개 → 4개) |

### 주요 함수 (`src/lib/data.ts`)

| 함수 | 반환 | 설명 | 집계 대상 |
|------|----------|------|---|
| `getAllRegions()` | `Region[]` | 전체 목록 — 검색·비교용 | 272 (일반구·폐지 포함) |
| `getAvailableMonths()` | `string[]` | 연월 목록 — **최상위 시군구 전체의 합집합** (모듈 캐시) | 230 (현행 최상위) |
| `getMonthStats(code, ym)` | `MonthlyStats \| null` | 단일 월 통계 | — |
| `getRegionDetail(code, ym?, range=12)` | `RegionDetail \| null` | 추이·연령·YoY. `range=0`이면 전체 기간 | 단일 |
| `getRegionBySlug(sido, sigungu)` | `Region \| null` | URL slug 조회 | — |
| `getRegionRank(code, ym)` | `RegionRank \| null` | 시도 내 + 전국 순위 | 230 (현행 최상위) |
| `getAllRegionRankings(ym)` | `RegionRankEntry[]` | 순위 리스트. 기준월 데이터 없는 지역은 제외(폴백 없음) | 230 (현행 최상위) |
| `getPopularRegions()` | `{code, rate}[]` | 12개월 증가율 TOP 6, 시도별 1개 | 230 (현행 최상위) |
| `getDecliningRegions()` | `{code, rate}[]` | 12개월 감소율 TOP 6, 시도별 1개 | 230 (현행 최상위) |
| `getAgingRegions()` | `{code, rate}[]` | 고령화 지수 TOP 6, 시도별 1개 | 230 (현행 최상위) |
| `getPopulationTrends(3\|6\|12)` | `{gainers, losers}` | 급증·급감 TOP 10 | 230 (현행 최상위) |
| `getNationalSummary()` | `NationalSummary \| null` | 전국 총인구 + 전월 증감 | 230 (현행 최상위) |
| `getSidoStats()` | `SidoStat[]` | 시도별 인구 + **전년 동월 대비** 변화율 | 230 (현행 최상위) |
| `getTopLevelRegions()` | `Region[]` | **합계·순위의 유일한 대상 셀렉터** | 233 (폐지 3 포함) |
| `getChildDistricts(parent, ym)` | `ChildDistrict[]` | 부모 시의 일반구 목록 (구별 현황 섹션용) | 해당 시의 구 |
| `getAgeGroups(code, ym)` | `AgeGroup[] \| null` | 연령 분포 (10세 단위) | 단일 |

**캐싱:** `indexCache`, `popularCache`, `decliningCache`, `agingCache`, `sidoStatsCache`, `nationalSummaryCache`(단일 값), `rankCache`/`trendCache`(Map). 모두 프로세스 메모리이며 무효화 경로가 없다 — 데이터가 빌드 산출물이므로 정상 동작이지만, 지역별 JSON은 요청마다 다시 읽는다.

### 타입 (`src/lib/types.ts`)

```ts
RegionLevel     'sigungu' | 'district'
Region          { code, sido, sigungu, level, retiredAfter?, successorCodes? }
                // level: 합계·순위 대상 판별 / retiredAfter: 개편 폐지 지역의 마지막 월
MonthlyStats    { population, households, householdSize, male, female }
                // year/month 제거됨 (2026-08-18) — ym 키가 같은 정보였다
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

`npm run test` = `build-data` + `vitest run`. 총 **67개, 전부 통과**.

| 파일 | 개수 | 지키는 것 |
|---|---:|---|
| `src/lib/data.test.ts` | 28 | 빌드 산출물 회귀 — 계층 판별, 전국 합계 대조, 순위 계층 분리, 폴백 금지, 개편 시계열 연속성, 구별 현황 합산, **폐지 지역 처리**, **지도 시도명 일치** |
| `scripts/lib/mois-csv.test.ts` | 31 | 파싱 규칙 — 인코딩 판별, 빈칸/결측 구분, 컬럼 순서 무관성, 연령 재집계(5세·10세), 불완전 구간 감지, NFD 파일명 |
| `src/lib/region-narrative.test.ts` | 8 | 서술 다양성 — 어떤 판정도 85%, 세대 분화 문장은 70%를 넘지 않아야 한다(`principles.md` B2) |

**두 층으로 나눈 이유:** 산출물 검사만으로는 파싱 결함을 못 잡는다. 파서가 파일을 0개 읽어도 "산출물이 일관적이다"는 통과할 수 있다 — D14가 정확히 그랬다. 파서 테스트는 고정 입력 문자열을 쓰므로 원본 데이터가 바뀌어도 규칙 자체의 회귀를 잡는다.

**의미 있음이 검증되었다:** D1(일반구 이중 계상)을 의도적으로 재주입했을 때 4개가 실패했다.

---

## 5. 알려진 결함

코드 실사(2026-08-09)로 확인. P0 작업(2026-08-10)에서 다수 해소되었다.

### ✅ 해소됨 (P0, 2026-08-10)

| # | 결함 | 조치 | 검증 |
|---|---|---|---|
| D1 | 일반구 이중 계상 — 전국·시도 합계가 39개 일반구를 두 번 더함 | `Region.level` 도입 + `getTopLevelRegions()` 단일 셀렉터로 집계 함수 전환 | 홈 전국 총인구 61,620,651 → **50,879,765** (MOIS 공식 51,097,986 대비 -0.43%) |
| D2 | 순위표 단위 혼재 — 수원시와 수원시 장안구가 같은 표에서 경쟁 | 순위·트렌딩·홈 인기지역 전부 최상위 시군구만 | `/ranking`에 일반구 0건, 고양시 중복 해소 |
| D3 | `nationalTotal` 불일치 (280 vs 269) | 실제 대상 수와 일치 | `nationalTotal: 229` |
| D4 | 세종특별자치시 404 (`sigungu: ''`) | 빌드 시 빈 sigungu를 시도명으로 채움 | `/세종특별자치시/세종특별자치시` → 200 |
| D5 | 출장소 11개 유령 엔트리 | 월 데이터 없는 지역은 `index.json`에서 제외 | 검색에서 사라짐, index 268 = 파일 268 |
| D7 | `/map` 설명문 "전월 대비" (실제는 전년 동월) | 문구 수정 | — |
| D8 | 레거시 JSON 34개 잔존 | `build-data`가 출력 디렉터리를 먼저 비움 | 고아 파일 0 |
| D9 | `sitemap.ts`/`robots.ts` 폴백 불일치 (`example.com`) | `src/lib/site.ts` 단일 출처로 통합 | robots·canonical·sitemap 동일 도메인 |
| D12 | 군위군 시계열 단절 (2023.07 경북→대구) | `LEGACY_CODE_MAP`에 `4772000000 → 2772000000` 추가 | 대구 군위군 **40개월** (2023.01~2026.04) 연속 |
| D13 | 정지된 데이터가 현재값처럼 노출 | `latestAvailable()` 폴백 제거 — 기준월 데이터 없으면 순위·합계에서 제외 | 경북 군위군 소멸 |
| — | sitemap·canonical 이중 슬래시 (`vercel.app//경기도/...`) | `SITE_URL`에서 후행 슬래시 정규화 | 이중 슬래시 0건 |

**집계 단위 확정:** `index.json` 268 = 최상위 시군구 **229** + 일반구 **39**. 일반구는 검색·비교·지역 상세에서는 유지되고, 합계·순위에서만 제외된다. 부모 시 상세의 "구별 현황" 섹션이 드릴다운 경로다.

### ✅ 해소됨 (P1, 2026-08-11)

| # | 결함 | 조치 | 검증 |
|---|---|---|---|
| D6 | 문서상 시군구 수 오류 — `/about`·`/methodology`·홈이 "226개"로 명시 | 하드코딩 제거, `getTopLevelRegions().length` 렌더 | 화면에 **229** 표기 |
| D10 | `src/components/ui/RangeToggle.tsx` 미사용 (`DetailTabs`에 동명 로컬 컴포넌트가 별도 존재) | 공용 파일 삭제 | dead code 0 |
| D11 | `getAvailableMonths()`가 index 첫 지역에만 의존 — 종로구가 최신월을 갖지 못하면 전 서비스 기준월이 밀린다 | 최상위 시군구 **전체의 합집합**으로 변경 + 모듈 캐시 | `data.test.ts` "연월 목록 (D11)" |
| — | `AnimatedNumber`가 서버 HTML에 0을 렌더 — 크롤러가 지역 페이지 핵심 수치를 전부 "0.0만 명"으로 읽었다 | 초기 상태를 실제 값으로 | `principles.md` B4로 원칙화 |
| — | 세대 분화 서술이 사실상 고정 템플릿 (229개 중 **225개**가 같은 문장) | 실제 분포(중앙값 1.00)에 맞춰 임계값 재설정 → 52/109/52/16 | `region-narrative.test.ts` 8개 |

### ✅ 해소됨 (P0-7 파서 재작성, 2026-08-18)

| # | 결함 | 조치 | 검증 |
|---|---|---|---|
| D14 | 파서가 신 형식 CSV를 한 개도 읽지 못함. `build-data`가 출력 디렉터리를 먼저 비워 **커밋된 JSON 269개를 지우고 빈 `index.json`만 쓰는** 상태였다 | 파서를 순수 모듈로 재작성(CP949 판별·컬럼명 조회·코드 추출). **읽은 파일이 0개면 디렉터리를 비우기 전에 `process.exit(1)`** | 43개월 272개 지역 생성. `npm run build`·`start` 정상 |
| D15 | 전국 합계 대조 기준값이 삭제된 `기타현황` CSV를 가리켜 `null` 반환 | 기준값을 원본 CSV의 **시도 합계 행**으로 전환 | 2026.07 우리 합계 = 시도 합계 = **50,871,820, 오차 0.000%** |
| — | `getRegionDetail()`이 기준월을 못 찾으면 그 지역의 마지막 달로 **조용히 폴백** — "2026년 7월"이라 쓰고 6월 수치를 보여주는 경로 | 기준월 지정 시 없으면 `null` 반환 | 폐지 지역 대상 회귀 테스트 추가 |
| — | 전주시만 매핑하고 완산구·덕진구를 빠뜨려 일반구가 부모를 잃고 최상위로 승격 (230→232) | `LEGACY_CODE_MAP`에 일반구 2건 추가 | 현행 최상위 **230** |
| — | `/map`의 시도명 매핑이 개편 후 이름과 어긋나 광주·전남 도형이 회색으로 남음 | 매핑을 순수 모듈(`src/lib/sido-map.ts`)로 분리하고 둘 다 통합시로 연결 | 양방향 일치 테스트 2개 |
| P1-7 | CSV 파서 단위 테스트 부재 | `scripts/lib/mois-csv.ts` 분리 + `mois-csv.test.ts` **31개** | 고정 입력 기반이라 원본이 바뀌어도 유효 |

### ⚠️ 남은 항목

### ✅ 해소됨 (P1-5·P1-8, 2026-08-19)

| # | 결함 | 조치 | 검증 |
|---|---|---|---|
| P1-5 | "전입출" 탭이 갖고 있지 않은 지표의 이름을 쓰고 있었고, "증감" 탭과 **같은 데이터로 같은 막대 차트를 두 번** 그렸다 | 두 탭을 증감 하나로 통합. 라벨을 전부 "증감"으로, 고지 문구에 순증감의 성격 명시 | 탭 5 → **4**, 중복 차트 제거 |
| D16 | `npm run lint`이 6 error + 1 warning으로 실패 | 아래 표 참조 | **0건** |

| 위반 | 조치 |
|---|---|
| `BookmarkButton` — effect 안 동기 setState | `useSyncExternalStore`로 전환. localStorage 는 React 밖 저장소이므로 이게 제 위치다. **다른 곳에서 즐겨찾기를 바꿔도 갱신**되는 부수 효과 |
| `CompareClient` ×2, `AgeCompareTab` — effect 안 동기 `setLoading(true)` | loading 을 **파생 상태**로. `{key, data}` 로 "어떤 (지역, 월) 결과인지"를 함께 담아 **결과가 null 인 경우와 로딩 중을 구분**한다(폐지 지역에서 실제로 갈린다). 요청 취소도 함께 추가 |
| `AgeCompareTab:158` — 렌더 중 `Math.random()` | 스켈레톤 폭을 고정 배열로 |
| `DetailTabs:68` — 렌더 중 ref 접근 | 전환 방향을 탭 클릭 시점에 계산해 state 로 |
| `DetailTabs:5` — 미사용 import | 제거 |

### 📋 남은 개선 (결함 아님)

| # | 항목 | 처리 |
|---|---|---|
| P2-5 | 연령 데이터가 인구 데이터보다 1개월 뒤처지는데 연령 탭에 기준월 표기가 없다 | `principles.md` B1 |
| — | 신설 지역 4개(인천)는 12개월이 쌓이기 전까지 YoY·판정이 비어 있다 | 2027.07에 자연 해소 |
