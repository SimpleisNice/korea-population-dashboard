# 서비스 기능 명세

> 최종 업데이트: 2026-05-14  
> 대상: 현재 배포 코드 기준 (main 브랜치)

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
| 데이터 출처 | 행정안전부(MOIS) 주민등록 인구통계 |
| 데이터 범위 | 269개 시군구 × 40개월 (2023.01 ~ 2026.04) |
| 갱신 주기 | 월 1회 수동 업데이트 |
| 렌더링 전략 | Server Component 기본, 인터랙티브 요소만 Client Component |
| URL 상태 관리 | nuqs 라이브러리 — 필터/선택 값이 URL에 반영되어 공유·새로고침 유지 |

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
| 전국 총괄 현황 | 전국 총인구, 전월 대비 증감, 기준 연월 표시 |
| 인구 급증 지역 | 최근 12개월 인구 증가율 TOP 6 (시도별 1개 제한, 서버 빌드 시 캐싱) |
| 관심 지역 | localStorage 저장 즐겨찾기 목록. 북마크 추가 시 표시 (최대 10개) |
| 최근 본 지역 | localStorage 기반 방문 이력 (최근 순) |

**관련 컴포넌트:** `RegionSearch`, `NationalSummary`, `PopularRegions`, `FavoriteRegions`, `RecentRegions`

---

### 2-2. 지역 요약 `/[sido]/[sigungu]`

**목적:** 특정 시군구의 핵심 인구 지표를 한눈에 확인.

**URL 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `ym` | `YYYYMM` | 최신 월 | 기준 연월 |
| `range` | `6 \| 12 \| all` | `12` | 추이 차트 표시 기간 |

**구성 요소:**

| 영역 | 기능 |
|------|------|
| 헤더 | 뒤로가기 / 검색 / 즐겨찾기 토글 / 비교 이동 / 공유 |
| 기준월 선택기 | 드롭다운으로 기준 연월 변경 (URL `ym` 업데이트) |
| 기준 정보 | 시도명 · 기준월 · 시도 내 순위 · 전국 순위 배지 |
| 핵심 지표 카드 (×2) | 총인구 / 세대수 — 전월 대비(MoM) + 전년 동월 대비(YoY) 증감 동시 표시 |
| 부가 지표 카드 (×2) | 세대당 인구 / 성비 (남자 수 · 여자 수) |
| 인구 추이 차트 | 월별 라인 차트. 기간 토글(6개월 / 12개월 / 전체) |
| 시점 비교 | 현재 월 vs 과거 특정 월 인구·세대 비교 |
| 상세보기 링크 | `/detail` 페이지로 이동 |
| 공유 바텀시트 | URL 복사 / 이미지(PNG) 저장 |
| 광고 | AdSense 배너 (뷰포트 진입 시 로드) |

**관련 컴포넌트:** `StatCard`, `TrendChart`, `RangeToggle`, `MonthPicker`, `TimePeriodCompare`, `BookmarkButton`, `ShareButton`

---

### 2-3. 지역 상세 `/[sido]/[sigungu]/detail`

**목적:** 인구추이 · 세대 · 연령 · 증감 데이터를 탭별로 심층 제공.

**URL 파라미터:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `ym` | `YYYYMM` | 최신 월 | 기준 연월 |

**탭 구성:**

| 탭 | 내용 |
|----|------|
| 인구추이 | 월별 라인 차트 + 최근 6개월 수치 테이블 |
| 세대 | 세대수·세대당인구 카드 + 세대수 추이 차트 |
| 연령 | **심층 지표 카드 4개** (고령화 지수·생산가능 비율·성비·중위 연령대) + 두 시점 연령 분포 오버레이 차트 |
| 증감 | 월별 인구 증감 막대 차트 |

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

**관련 컴포넌트:** `DetailTabs`, `TrendChart`, `ChangeChart`, `AgeChart`, `AgeCompareTab`, `AgeInsightCards`, `MonthPicker`

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
| 기준월 선택기 | MonthPicker — 변경 시 두 지역 데이터 재fetch |
| 지역 검색 (A/B) | CompareSearch — 선택/해제 가능, URL 자동 업데이트 |
| 비교 지표 테이블 | 8개 지표 나란히 비교 (A=파란색, B=보라색) |
| 추이 오버레이 차트 | 두 지역 월별 인구 라인 차트 오버레이 |
| 광고 | 두 지역 모두 선택 시 노출 |

**비교 지표 8개:**

| 지표 | 설명 |
|------|------|
| 총인구 | — |
| 세대수 | — |
| 세대당 인구 | — |
| 남자 인구 | — |
| 여자 인구 | — |
| 성비 | 남 ÷ 여 × 100 |
| 전년 동월 증감률 | (현재 − 1년 전) ÷ 1년 전 × 100 |
| 고령 인구 비율 | 60세+ ÷ 총인구 × 100 |

**관련 컴포넌트:** `CompareClient`, `CompareSearch`, `MonthPicker`

---

### 2-5. 지역 순위 `/ranking`

**목적:** 전국 시군구를 원하는 지표 기준으로 순위 조회.

**URL 파라미터:** 없음 (정렬·필터는 클라이언트 상태)

**기능:**

| 항목 | 내용 |
|------|------|
| 기준 연월 표시 | 최신 데이터 기준월 고정 표시 |
| 정렬 기준 (4종) | 총인구 / 전월 증감 / 전년 동월 증감률 / 세대수 |
| 시도 필터 | 전체 + 17개 시도 드롭다운 |
| 순위 리스트 | 순위 번호 · 지역명 · 선택 지표값 · 증감 방향 아이콘 |
| 지역 클릭 | 해당 지역 요약 페이지로 이동 |
| 광고 | 리스트 하단 |

**관련 컴포넌트:** `RankingClient`, `RankingHeader`

---

### 2-6. 인구 트렌딩 `/trending`

**목적:** 최근 인구 변화가 큰 지역(급증·급감)을 탐색.

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
| 광고 | 하단 |

**관련 컴포넌트:** `TrendingClient`

---

## 3. 공통 컴포넌트

### 레이아웃

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `MobileShell` | `components/layout/` | 최대 너비 제한 + 하단 네비 여백 래퍼 |
| `Header` | `components/layout/` | sticky 상단바. `title`, `showBack`, `showSearch`, `right` props |
| `BottomNav` | `components/layout/` | 홈 / 순위 / 비교 3탭 하단 네비게이션 |

### 지역 관련

| 컴포넌트 | 설명 |
|---------|------|
| `StatCard` | 지표 카드. `value`, `change`(MoM), `yoyChange`(YoY), `unit`, `small` props |
| `TrendChart` | Recharts 기반 라인 차트. `data`, `color`, `height` props |
| `BookmarkButton` | localStorage 즐겨찾기 토글 버튼 (Heart 아이콘) |
| `ShareButton` | 공유 바텀시트. URL 복사 · PNG 이미지 저장 |
| `TimePeriodCompare` | 두 시점 인구 비교 섹션 (Client Component, Server Action으로 데이터 fetch) |

### UI 공용

| 컴포넌트 | 설명 |
|---------|------|
| `MonthPicker` | 기준 연월 드롭다운 선택기 (nuqs로 URL `ym` 업데이트) |
| `RangeToggle` | 추이 차트 기간 토글 (6 / 12 / all, nuqs로 URL `range` 업데이트) |
| `AdSlot` | AdSense 광고 슬롯. IntersectionObserver로 뷰포트 진입 시 스크립트 로드 |

---

## 4. 데이터 레이어

### 데이터 흐름

```
행안부 MOIS CSV
  → scripts/csv-to-json.ts (빌드 전 수동 실행)
  → public/data/regions/{code}.json (269개 파일)
  → src/lib/data.ts (서버 사이드 함수)
  → Server Component / Server Action
  → Client Component (props로 전달)
```

### 주요 함수 (`src/lib/data.ts`)

| 함수 | 반환 타입 | 설명 |
|------|----------|------|
| `getAllRegions()` | `Region[]` | 전체 시군구 목록 (index.json) |
| `getAvailableMonths()` | `string[]` | 사용 가능한 연월 목록 (YYYYMM 형식) |
| `getRegionDetail(code, ym?, range?)` | `RegionDetail \| null` | 지역 상세 (추이·연령·YoY 포함) |
| `getRegionBySlug(sido, sigungu)` | `Region \| null` | URL slug로 지역 조회 |
| `getRegionRank(code, ym)` | `RegionRank \| null` | 시도 내 순위 + 전국 순위 |
| `getAllRegionRankings(ym)` | `RegionRankEntry[]` | 전체 지역 순위 데이터 |
| `getPopularRegions()` | `string[]` | 12개월 증가율 TOP 6 코드 (시도별 1개 제한, 캐싱) |
| `getPopulationTrends(period)` | `{gainers, losers}` | 급증·급감 TOP 10 (3/6/12개월) |
| `getNationalSummary()` | `NationalSummary` | 전국 총인구 + 전월 증감 |
| `getAgeGroups(code, ym)` | `AgeGroup[] \| null` | 연령별 분포 (10세 단위) |

### 주요 타입 (`src/lib/types.ts`)

```ts
Region          { code, sido, sigungu }
MonthlyStats    { year, month, population, households, householdSize, male, female }
RegionDetail    { region, latest, prevMonth, yoyMonth, trend, ageGroups }
RegionRank      { nationalRank, nationalTotal, sidoRank, sidoTotal }
AgeGroup        { label, male, female }  // 예: { label: "30–39", male: 12345, female: 11234 }
TrendPoint      { label, population, households, change }
TrendEntry      { region, startPop, endPop, change, changeRate }
NationalSummary { totalPopulation, prevMonthChange, month }
```

### Server Actions (`src/lib/actions.ts`)

| 함수 | 설명 |
|------|------|
| `fetchRegionDetail(code, ym?)` | 비교 페이지에서 지역 선택/월 변경 시 호출 |
| `fetchMonthStats(code, ym)` | 시점 비교 컴포넌트에서 과거 월 데이터 fetch |
| `fetchAgeGroups(code, ym)` | 연령 탭 비교 시점 변경 시 연령 데이터 fetch |

---

## 5. 미구현 백로그

### B1. 비교 페이지 진입 시 현재 지역 자동 셋팅

**현재 동작**  
지역 요약 페이지의 비교 버튼 클릭 시 `region_a`만 셋팅된 채 이동.

**개선 방향**  
이미 비교 페이지에 `region_a`가 있는 상태에서 다른 지역의 비교 버튼을 클릭하면 `region_b`에 자동으로 채워지도록 처리.

**영향 범위**
- `src/app/[sido]/[sigungu]/page.tsx` — `compareUrl` 생성 로직 수정

---

### B2. 비교 페이지 광고 노출 조건 완화

**현재 동작**  
`region_a && region_b` 두 지역 모두 선택 시에만 광고 노출.

**개선 방향**  
`region_a || region_b` — 한 지역만 선택된 상태에서도 광고 노출.

**영향 범위**
- `src/app/compare/page.tsx` — AdSlot 렌더링 조건 수정
