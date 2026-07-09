# 서비스 기능 명세

> 최종 업데이트: 2026-07-09
> 대상: 현재 배포 코드 기준 (main 브랜치, 최근 커밋 `7082219`)

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [페이지 명세](#2-페이지-명세)
3. [공통 컴포넌트](#3-공통-컴포넌트)
4. [데이터 레이어](#4-데이터-레이어)
5. [미구현 백로그](#5-미구현-백로그)

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 인구통계 (대한민국 거주 인구 통계 대시보드) |
| URL | https://korea-population-dashboard.vercel.app |
| 타깃 사용자 | 부동산 구매·투자 검토 중인 개인, 이주 지역 리서치 중인 사용자 |
| 데이터 출처 | 행정안전부(MOIS) 주민등록 인구통계 (인구·세대 / 연령별 2종 CSV) |
| 데이터 범위 | 약 280개 시군구(+ 시 구 단위 세분 포함) × 2023.01 ~ 최신월 |
| 갱신 주기 | 월 1회 수동 업데이트 (`data/raw/`에 CSV 추가 후 `npm run build-data`) |
| 렌더링 전략 | Server Component 기본, 인터랙티브 요소만 Client Component |
| UI 테마 | 라이트 미니멀 (다크 모드 없음), 모바일 전용 레이아웃 (`max-width: 430px`) |
| URL 상태 관리 | nuqs / Next.js 16 async `searchParams` — 필터·선택 값이 URL에 반영되어 공유·새로고침 유지 |
| 수익화 | Google AdSense (승인 심사 대응 완료: 개인정보처리방침·서비스소개 페이지, 에디토리얼 콘텐츠, Footer 추가) |

---

## 2. 페이지 명세

### 2-1. 홈 `/`

**목적:** 서비스 진입점. 지역 검색 및 주요 지역 빠른 접근.

**URL 파라미터:** 없음

**구성 요소 (위→아래):**

| 영역 | 기능 |
|------|------|
| 로고·서브타이틀 | 서비스명 + 한 줄 소개 |
| 지역 검색창 | 시군구 이름 퍼지 검색 (Fuse.js). 결과 클릭 시 지역 상세 이동 |
| 전국 총괄 현황 | 전국 총인구, 전월 대비 증감, 기준 연월 표시. 하단에 `/trending`("기간별 트렌드")·`/ranking`("지역 순위") 바로가기 칩 |
| 인기 지역 탭 | 급증·급감·고령화 3탭 전환. 각 탭 TOP 6 (시도별 1개, 최근 12개월 고정). 칩에 증감률 뱃지 (▲/▼ %) 표시. 탭 전환 애니메이션 |
| 관심 지역 | localStorage 저장 즐겨찾기 목록. 북마크 추가 시 표시 (최대 10개) |
| 최근 본 지역 | localStorage 기반 방문 이력 (최근 순) |

> UI/UX 개선(2026-07-09): 전국 총괄 현황의 트렌드 바로가기 칩 라벨을 "급증·급감 지역"에서 "기간별 트렌드"로 변경. 바로 아래 인기 지역 탭이 이미 "급증/급감/고령화" TOP6(12개월 고정)를 보여주고 있어, 동일한 문구의 칩이 3·6·12개월 기간별 TOP10을 보여주는 `/trending`으로 연결되는 것이 진입 경로 중복처럼 보였다. 라벨을 기간 분석이라는 차별점으로 바꿔 두 진입점의 역할을 구분했다.

**관련 컴포넌트:** `HomePageClient`, `RegionSearch`, `NationalSummary`, `PopularRegions`, `FavoriteRegions`, `RecentRegions`

---

### 2-2. 지역 요약 `/[sido]/[sigungu]`

**목적:** 특정 시군구의 핵심 인구 지표를 한눈에 확인.

**URL 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `ym` | `YYYYMM` | 최신 월 | 기준 연월 |
| `cmp` | `YYYYMM` | — | 시점 비교 대상 월 |

**구성 요소:**

| 영역 | 기능 |
|------|------|
| 헤더 | 뒤로가기 / 검색 / 즐겨찾기 토글 / 비교 이동 / 공유 |
| 기준월 선택기 | 드롭다운으로 기준 연월 변경 (URL `ym` 업데이트) |
| 기준 정보 | 시도명 · 기준월 · 시도 내 순위 · 전국 순위 배지 |
| 핵심 지표 카드 (×2) | 총인구 / 세대수 — 전월 대비(MoM) + 전년 동월 대비(YoY) 증감 동시 표시, count-up 애니메이션 |
| 부가 지표 카드 | 세대당 인구 / 성비(`SexRatioCard`, 남녀 비율 바) |
| 인구 추이 차트 | 월별 라인 차트(그라디언트). 기간 토글(6개월 / 12개월 / 전체) |
| 시점 비교 | 현재 월 vs 과거 특정 월 인구·세대 비교 (Server Action fetch) |
| 상세보기 링크 | `/detail` 페이지로 이동 |
| 공유 바텀시트 | URL 복사 / 이미지(PNG, html2canvas) 저장 |
| 광고 | `AdSlot` (뷰포트 진입 시 스크립트 push) |

**관련 컴포넌트:** `StatCard`, `TrendChart`, `SexRatioCard`, `RangeToggle`, `MonthPicker`, `TimePeriodCompare`, `BookmarkButton`, `ShareButton`

---

### 2-3. 지역 상세 `/[sido]/[sigungu]/detail`

**목적:** 인구추이 · 세대 · 연령 · 증감 · 전입출 데이터를 탭별로 심층 제공.

**URL 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `ym` | `YYYYMM` | 최신 월 | 기준 연월 |

**탭 구성 (`DetailTabs`, 스프링 인디케이터 애니메이션):**

| 탭 | 내용 |
|----|------|
| 인구추이 | 월별 라인 차트 + 향후 6개월 예측 점선 오버레이 + 최근 6개월 수치 테이블 |
| 세대 | 세대수·세대당인구 카드 + 세대수 추이 차트 |
| 연령 | 심층 지표 카드 4개 (고령화 지수·생산가능 비율·성비·중위 연령대) + 두 시점 연령 분포 오버레이 차트 |
| 증감 | 월별 인구 증감 막대 차트(`ChangeChart`) + 전년 동월 대비 막대 차트(`YoYBarChart`) + 기간 요약 카드 |
| 전입출 | 순이동 인사이트 카드 + 월별 순이동 막대 + 누적 순이동 area 차트 — **주민등록 인구·세대 CSV의 월별 증감을 이용한 근사값**(별도 전입출 원본 CSV는 미사용) |

**연령 탭 심층 지표 계산 기준 (10세 단위 버킷):**

| 지표 | 계산식 |
|------|--------|
| 고령화 지수 | 60세+ ÷ 0~19세 × 100 (100 초과 = 고령화 진행, 강조 표시) |
| 생산가능인구 비율 | 20~59세 ÷ 총인구 × 100 |
| 성비 | 남성 합계 ÷ 여성 합계 × 100 |
| 중위 연령대 | 누적 인구 50% 기준 연령 구간 |

**연령 분포 시점 비교:**
- 기본값: 현재 월 vs 24개월 전
- 드롭다운으로 비교 시점 변경 가능
- 현재 시점 막대(진한색) + 비교 시점 막대(반투명) 오버레이

**관련 컴포넌트:** `DetailTabs`, `TrendChart`, `ChangeChart`, `YoYBarChart`, `MigrationTab`, `AgeChart`, `AgeCompareTab`, `AgeInsightCards`, `MonthPicker`

---

### 2-4. 지역 비교 `/compare`

**목적:** 두 시군구의 인구 지표를 나란히 비교.

**URL 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `region_a` | 지역코드 (10자리) | — | A 지역 |
| `region_b` | 지역코드 (10자리) | — | B 지역 |
| `ym` | `YYYYMM` | 최신 월 | 기준 연월 |

**기능:**

| 영역 | 내용 |
|------|------|
| 기준월 선택기 | MonthPicker — 변경 시 두 지역 데이터 재fetch (Server Action) |
| 지역 검색 (A/B) | `CompareSearch` — 선택/해제 가능, URL 자동 업데이트 |
| 비교 지표 테이블 | 8개 지표 나란히 비교 (A=파란색, B=보라색) |
| 추이 오버레이 차트 | 두 지역 월별 인구 라인 차트 오버레이 |
| 연령 구조 비교 | 두 지역의 연령대별 인구 구성비(%)를 지역 A(파랑)/B(보라) 막대로 직접 비교. 성별 분리 없이 연령대 합계만 사용 — 성비는 비교 테이블에 별도 지표로 이미 존재 |
| 에디토리얼 안내 | 비교 지표 해석 가이드 텍스트 |
| 광고 | 두 지역 모두 선택 시 노출 (`AdSlot`) |

**비교 지표 8개:** 총인구 · 세대수 · 세대당 인구 · 남자 인구 · 여자 인구 · 성비 · 전년 동월 증감률 · 고령 인구 비율(60세+ ÷ 총인구 × 100)

**관련 컴포넌트:** `CompareClient`, `CompareSearch`, `MonthPicker`, `AgeStructureCompareChart`

> UI/UX 개선(2026-07-09): 기존에는 상세 페이지의 "시점 비교"용 `AgeChart`(남/여 분리, 진하기로 비교 대상 구분)를 지역 비교에 재사용해 한 연령대에 막대 4개가 겹쳐 보이고 지역 A/B 구분이 옅은 투명도 차이뿐이라 읽기 어려웠다. `AgeStructureCompareChart`(전용 컴포넌트, `src/components/compare/`)로 교체하여 연령대별 합계만 놓고 지역 A/B를 테이블과 동일한 파랑/보라 색상으로 직접 비교하도록 단순화했다.

---

### 2-5. 지역 순위 `/ranking`

**목적:** 전국 시군구를 원하는 지표 기준으로 순위 조회.

**URL 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `sort` | `population \| popChange \| popChangeRate \| households` | `population` | 정렬 기준 |
| `sido` | 시도명 (한국어) | — | 시도 필터 |

**기능:**

| 항목 | 내용 |
|------|------|
| 페이지 설명 | 상단 에디토리얼 안내 텍스트 |
| 기준 연월 표시 | 최신 데이터 기준월 + 트렌딩 바로가기 (`RankingHeader`, 상단 `Header`와 제목 중복 없이 기준월만 표시) |
| 정렬 기준 (4종) | 총인구 / 전월 증감 / 전년 동월 증감률 / 세대수 |
| 시도 필터 | 전체 + 17개 시도. 가로 스크롤 칩, 우측 페이드 힌트로 스크롤 가능함을 표시 |
| 순위 리스트 | 순위 번호 · 지역명 · 선택 지표값 · 증감 방향 아이콘 |
| 지역 클릭 | 해당 지역 요약 페이지로 이동 |
| 광고 | 리스트 하단 (`AdSlot`) |
| 해설 섹션 + Footer | 하단 콘텐츠 보강 |

**관련 컴포넌트:** `RankingClient`, `RankingHeader`, `AdSlot`, `Footer`

> UI/UX 개선(2026-07-09): `RankingHeader`가 상단 `Header`와 동일하게 "지역 순위" 제목을 중복 표시하던 것을 제거하고 기준월·트렌딩 링크만 남김. 시도 필터 칩 목록에 우측 그라데이션 페이드를 추가해 가로 스크롤 가능함을 시각적으로 알림.

---

### 2-6. 인구 트렌딩 `/trending`

**목적:** 최근 인구 변화가 큰 지역(급증·급감)을 탐색. (하단 내비게이션에는 `/ranking`과 통합 표시되며 별도 탭 없음)

**URL 파라미터:** 없음 (기간은 클라이언트 상태)

**기능:**

| 항목 | 내용 |
|------|------|
| 기간 선택 | 3개월 / 6개월 / 12개월 세그먼트 토글 |
| 급증 TOP 10 | 선택 기간 내 인구 증가율 상위 10개 지역 |
| 급감 TOP 10 | 선택 기간 내 인구 감소율 상위 10개 지역 |
| 표시 항목 | 지역명 · 변화 인원 · 변화율(%) · 방향 아이콘 |
| 지역 클릭 | 해당 지역 요약 페이지로 이동 |
| 순위 바로가기 | 헤더 우측 링크 버튼 → `/ranking` |
| 광고 + 해설 + Footer | 하단 콘텐츠 보강 |

**관련 컴포넌트:** `TrendingClient`, `AdSlot`, `Footer`

---

### 2-7. 인구 지도 `/map`

**목적:** 17개 시도의 인구 증감을 SVG 지도(choropleth)로 시각화하여 탐색성 강화.

**URL 파라미터:** 없음

**기능:**

| 항목 | 내용 |
|------|------|
| 페이지 설명 | 색상 스케일 안내 텍스트 |
| 히트맵 | `@svg-maps/south-korea` + `d3-scale` 기반 SVG 지도. 전월 대비 증감률 기준 색상(파랑=증가, 빨강=감소) |
| 시도 클릭 | 해당 시도 상세 정보 표시 / 이동 |
| 해설 + Footer | 인구 이동 트렌드(수도권 집중·지방 소멸) 해설 텍스트 |

**관련 컴포넌트:** `KoreaHeatmap`, `FadeIn`, `Footer`

**데이터 함수:** `getSidoStats()` — 시도별 인구·증감 통계 집계 (`src/lib/data.ts`)

---

### 2-8. 서비스 소개 `/about`

**목적:** AdSense 심사 및 신규 사용자 온보딩을 위한 서비스 설명 페이지.

**구성:** 서비스 개요, 주요 기능 4가지(지역 순위·인구 트렌딩·인구 지도·지역 비교) 카드, 데이터 출처 안내, 면책 조항.

---

### 2-9. 개인정보처리방침 `/privacy`

**목적:** AdSense 심사 요건 충족 및 법적 고지.

**구성:** 수집 개인정보 항목(원칙적으로 회원가입 없이 이용 — 접속 로그·쿠키 등 자동 수집 항목 명시), 이용 목적, 보유 기간, 제3자 제공(Google AdSense), 쿠키 운영, 문의처 등 표준 조항. 시행일 2026-06-30.

---

### 2-10. 데이터 방법론 `/methodology`

**목적:** AdSense "저품질 콘텐츠" 대응 — 데이터 수집·집계 방식과 지표 정의를 설명하는 고유 콘텐츠 페이지. (from/back: `/about`, Footer·About에서 링크)

**구성:** 데이터 출처와 갱신 주기, 집계 단위(226개 시군구)와 행정경계 변경 처리(레거시 코드 병합), 지표 정의(총인구·세대수·세대당 인구·전월 증감·전년 동기 증감률(YoY)·성비·연령 구조), 해석 가이드.

---

## 3. 공통 컴포넌트

### 레이아웃 (`src/components/layout/`)

| 컴포넌트 | 설명 |
|---------|------|
| `MobileShell` | 최대 너비(430px) 제한 + 하단 네비 여백 래퍼 |
| `Header` | sticky 상단바. `title`, `showBack`, `showSearch`, `right` props |
| `BottomNav` | 홈 / 지도 / 순위(트렌딩 포함) / 비교 4탭 하단 네비게이션. frosted-glass 배경 + 스프링 애니메이션 |
| `Footer` | 서비스 소개·개인정보처리방침 링크, 데이터 출처 안내 (콘텐츠 페이지 하단 공통 배치) |

### 지역 관련 (`src/components/region/`)

| 컴포넌트 | 설명 |
|---------|------|
| `StatCard` | 지표 카드. `value`, `change`(MoM), `yoyChange`(YoY), `unit`, `small` props. count-up 애니메이션 |
| `SexRatioCard` | 남녀 성비 바 시각화 |
| `TrendChart` | Recharts 기반 그라디언트 라인 차트. `data`, `color`, `height` props. Y축 도메인은 0 고정이 아니라 데이터 최소·최댓값 주변에 여유(15%)를 둔 동적 범위 — 인구·세대수처럼 월별 변화폭이 전체 값 대비 작은 지표도 추이가 시각적으로 드러난다 |
| `YoYBarChart` | 전년 동월 대비 증감 막대 차트 |
| `BookmarkButton` | localStorage 즐겨찾기 토글 버튼 (Heart 아이콘) |
| `ShareButton` | 공유 바텀시트. URL 복사 · PNG 이미지 저장(html2canvas) |
| `TimePeriodCompare` | 두 시점 인구 비교 섹션 (Client Component, Server Action으로 데이터 fetch) |

### UI 공용 (`src/components/ui/`)

| 컴포넌트 | 설명 |
|---------|------|
| `MonthPicker` | 기준 연월 드롭다운 선택기 (nuqs로 URL `ym` 업데이트) |
| `RangeToggle` | 추이 차트 기간 토글 (6 / 12 / all, nuqs로 URL `range` 업데이트) |
| `AnimatedNumber` | count-up 숫자 애니메이션 |
| `FadeIn` | 진입 시 fade 트랜지션 래퍼 |
| `Skeleton` | 로딩 상태 shimmer 플레이스홀더 |

### 광고 (`src/components/AdSlot.tsx`)

`AdSlot` — Google AdSense 광고 슬롯. `slot`, `format`, `style`, `className`, `enabled`(기본 true) props. `slot`이 비었거나 `enabled=false`면 `null`을 반환해 광고 유닛을 아예 렌더하지 않는다(빈 슬롯·콘텐츠 없는 화면에 광고를 노출하는 AdSense 정책 위반 방지). 활성 상태에서만 `adsbygoogle.push()`를 1회 호출하고 "광고" 라벨을 함께 표시. 퍼블리셔 ID는 실 운영 ID(`ca-pub-4466379680692265`)로 하드코딩, 슬롯 ID는 `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` 환경변수로 주입. 현재 홈·순위·트렌딩 3개 콘텐츠 페이지의 콘텐츠 하단에만 배치.

**AdSense 정책 주의:** 계정에서 **자동 광고(Auto Ads)를 반드시 OFF**로 유지해야 한다. `adsbygoogle.js`는 전 페이지(`layout.tsx` head)에 로드되므로, 자동 광고가 켜지면 지도·비교 빈 상태 등 콘텐츠가 얇은 화면에도 광고가 자동 삽입되어 "게시자 콘텐츠가 없는 화면" 위반이 발생한다.

---

## 4. 데이터 레이어

### 데이터 흐름

```
행안부 MOIS CSV (data/raw/*.csv, 2종: 인구·세대 / 연령별)
  → scripts/csv-to-json.ts (npm run build-data — dev/build 전 자동 실행)
  → public/data/regions/{code}.json (지역별) + index.json (전체 목록)
  → src/lib/data.ts: fs.readFileSync 로 요청 시점에 JSON 로드
      (index.json만 프로세스 메모리에 캐싱, 지역별 JSON은 요청마다 읽음)
  → Server Component / Server Action
  → Client Component (props로 전달)
```

**중요:** 런타임에 CSV를 직접 파싱하지 않는다. CSV → JSON 변환은 빌드/개발 서버 기동 전 전처리 단계(`build-data` 스크립트)에서만 일어나며, 원본 CSV 파일은 `data/raw/`에 있고 `public/data/`에는 없다.

### CSV 파싱 (`scripts/csv-to-json.ts`)

MOIS CSV는 두 가지 포맷을 사용하며 구조가 다르다:

- **인구·세대 CSV** (`*_registered_population_and_household_monthly.csv`): 1행 메타데이터, 2행 월 헤더(반복), 3행 컬럼 타입 헤더, 4행부터 데이터. 월당 5개 컬럼(총인구·세대수·세대당인구·남자·여자).
- **연령별 CSV** (`*_population_by_age_monthly.csv`): 1행 메타데이터, 2행 월 헤더, 3행 컬럼 헤더, **4행이 아닌 5행부터 데이터** (연령 구간이 한 행 더 있음). 10세 단위로 재집계하여 저장.

`splitCSVLine()`이 따옴표로 감싼 콤마 포함 숫자(`"1,234,567"`)를 분리하고, `parseNum()`이 콤마를 제거해 숫자로 변환한다.

**행정구역 개편 대응:** `LEGACY_CODE_MAP`으로 강원특별자치도(42xx→51xx, 2023.06) / 전북특별자치도(45xx→52xx, 2024.01) 개편 전후 코드를 병합해 시계열 연속성을 유지한다.

**전입출 데이터:** `data/raw/`에 `*_other_population_change_monthly.csv`(전입·출 등 기타 인구변동) 파일이 존재하지만 **현재 파싱 파이프라인에서 사용하지 않는다**. 상세 페이지 "전입출" 탭은 인구·세대 CSV의 월별 순증감을 순이동 근사치로 사용한다.

### 주요 함수 (`src/lib/data.ts`)

| 함수 | 반환 타입 | 설명 |
|------|----------|------|
| `getAllRegions()` | `Region[]` | 전체 시군구 목록 (index.json) |
| `getAvailableMonths()` | `string[]` | 사용 가능한 연월 목록 (YYYYMM 형식) |
| `getRegionDetail(code, ym?, range?)` | `RegionDetail \| null` | 지역 상세 (추이·연령·YoY 포함) |
| `getRegionBySlug(sido, sigungu)` | `Region \| null` | URL slug로 지역 조회 |
| `getRegionRank(code, ym)` | `RegionRank \| null` | 시도 내 순위 + 전국 순위 |
| `getAllRegionRankings(ym)` | `RegionRankEntry[]` | 전체 지역 순위 데이터 |
| `getPopularRegions()` | `{ code, rate }[]` | 12개월 증가율 TOP 6 + 증감률 (시도별 1개 제한, 캐싱) |
| `getDecliningRegions()` | `{ code, rate }[]` | 12개월 감소율 TOP 6 + 감소율 (시도별 1개 제한, 캐싱) |
| `getAgingRegions()` | `{ code, rate }[]` | 고령화 지수 TOP 6 + 지수값 (시도별 1개 제한, 캐싱) |
| `getPopulationTrends(period)` | `{gainers, losers}` | 급증·급감 TOP 10 (3/6/12개월) |
| `getNationalSummary()` | `NationalSummary` | 전국 총인구 + 전월 증감 |
| `getAgeGroups(code, ym)` | `AgeGroup[] \| null` | 연령별 분포 (10세 단위) |
| `getSidoStats()` | `SidoStat[]` | 시도별 인구·증감 통계 (`/map` 히트맵용) |

### 주요 타입 (`src/lib/types.ts`)

```ts
Region          { code, sido, sigungu }
MonthlyStats    { year, month, population, households, householdSize, male, female }
RegionDetail    { region, latest, prevMonth, yoyMonth, trend, ageGroups }
RegionRank      { nationalRank, nationalTotal, sidoRank, sidoTotal }
AgeGroup        { label, male, female }  // 예: { label: "30–39", male: 12345, female: 11234 }
TrendPoint      { label, population, households, change, householdsChange }
TrendEntry      { region, startPop, endPop, change, changeRate }
NationalSummary { totalPopulation, prevMonthChange, month }
CompareData     { a: RegionDetail, b: RegionDetail }
```

### Server Actions (`src/lib/actions.ts`)

| 함수 | 설명 |
|------|------|
| `fetchRegionDetail(code, ym?)` | 비교 페이지에서 지역 선택/월 변경 시 호출 |
| `fetchMonthStats(code, ym)` | 시점 비교 컴포넌트에서 과거 월 데이터 fetch |
| `fetchAgeGroups(code, ym)` | 연령 탭 비교 시점 변경 시 연령 데이터 fetch |

### 기타 유틸

- `src/lib/favorites.ts` — localStorage 기반 즐겨찾기 CRUD
- `src/lib/chart-utils.ts` — 차트 애니메이션 상수 및 헬퍼
- `src/lib/utils.ts` — 공용 포맷/계산 유틸리티

### 테스트

`vitest`가 설정되어 있으나(`vitest.config.mjs`), 현재 저장소에는 실행 가능한 테스트 파일이 없다 (`npx vitest run` → "No test files found"). CSV 파싱·집계 로직에 대한 회귀 테스트는 백로그 항목이다.

---

## 5. 미구현 백로그

~~B1. 비교 페이지 진입 시 현재 지역 자동 셋팅~~ → ✅ 완료
~~B2. 비교 페이지 광고 노출 조건 완화~~ → ✅ 완료
~~E-1. 지도 기반 탐색 (`/map`, SVG choropleth)~~ → ✅ 완료
~~D-1. 전입출 탭~~ → ✅ 완료 (근사치 기반)
~~AdSense 심사 대응 (개인정보처리방침/서비스소개/Footer)~~ → ✅ 완료
~~UI/UX 감사 P0~P2 (추이 차트 Y축, 비교 페이지 연령 차트, 홈 정보구조, 랭킹 페이지 정리)~~ → ✅ 완료 (2026-07-09, 상세는 § 2-1/2-4/2-5 및 § 3 참고)

### 남은 항목 (4순위, M 시리즈)

| 항목 | 목적 |
|------|------|
| M-1 | 알림/구독 — 관심 지역 인구 변동 알림 |
| M-2 | AI 인사이트 — 지역 데이터 자동 요약/해설 |
| M-3 | 프리미엄 리포트 — 심층 분석 유료 리포트 |
| M-4 | 데이터 갱신 자동화 — 현재 수동인 `data/raw/` CSV 추가·`build-data` 실행 프로세스 자동화 |

새 기능 제안 시 위 4개 항목이거나, 이미 구현된 기능(지도/전입출/비교/랭킹/트렌딩)의 자연스러운 확장인지 확인할 것.

### 테스트 커버리지 (신규 제안)

CSV → JSON 변환 로직(`scripts/csv-to-json.ts`)과 `src/lib/data.ts`의 집계 함수에 대한 vitest 테스트가 현재 없음. 데이터 파이프라인 회귀 방지를 위해 우선순위 있게 추가 검토.
