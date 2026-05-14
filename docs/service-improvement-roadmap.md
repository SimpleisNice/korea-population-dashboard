# 서비스 개선 로드맵

> 작성일: 2026-05-13 / 최종 업데이트: 2026-05-14  
> 용도: 개발 스프린트 기획 및 이력 관리

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 대한민국 거주 인구 통계 대시보드 |
| 타깃 사용자 | 부동산 구매·투자 검토 중인 개인, 이주 지역 리서치 중인 사용자 |
| 데이터 출처 | 행정안전부(MOIS) 주민등록 인구 통계 |
| 데이터 범위 | 269개 시군구 × 40개월 (2023.01 ~ 2026.04) |
| 갱신 주기 | 월 1회 수동 업데이트 |

| 페이지 | 경로 | 핵심 기능 |
|--------|------|-----------|
| 홈 | `/` | 퍼지 검색, 인구 급증 지역 TOP 6(동적), 즐겨찾기, 최근 본 지역, 전국 총괄 현황 |
| 지역 상세 | `/[sido]/[sigungu]` | 인구·세대 카드(MoM·YoY), 추이 차트(6/12/전체), 시도·전국 순위 배지, 시점 비교 |
| 상세 탭 | `/[sido]/[sigungu]/detail` | 인구추이 / 세대 / 연령(심층 지표 + 시점 비교) / 월별 증감 |
| 비교 | `/compare` | A·B 지표 8개 비교 테이블(성비·YoY%·고령 비율 포함) + 추이 오버레이 |
| 순위 | `/ranking` | 총인구·전월증감·전년증감률·세대수 정렬, 시도 필터 |
| 트렌딩 | `/trending` | 3/6/12개월 기준 급증·급감 TOP 10 |

---

## 2. 구현 이력

### Phase 1 — Quick Wins ✅ 완료 (2026-05-13)

| ID | 기능 | 상태 |
|----|------|------|
| I1 | 전년 동월(YoY) 비교 — StatCard MoM·YoY 동시 표시 | ✅ |
| I6 | 지역 내 순위 배지 — 시도 내 N위 · 전국 N위 | ✅ |
| N3 | 전국 총괄 현황 홈 배너 | ✅ |
| N4 | 즐겨찾기 (localStorage, 최대 10개) | ✅ |

**주요 파일:** `src/lib/types.ts`, `src/lib/data.ts`, `src/lib/favorites.ts`, `src/components/region/StatCard.tsx`, `src/components/region/BookmarkButton.tsx`, `src/components/home/NationalSummary.tsx`, `src/components/home/FavoriteRegions.tsx`

---

### Phase 2 — Core Improvements ✅ 완료 (2026-05-13)

| ID | 기능 | 상태 |
|----|------|------|
| N1 | 지역 순위 페이지 `/ranking` | ✅ |
| N2 | 인구 급증·급감 탐색 `/trending` | ✅ |
| I3 | 추세 차트 기간 선택 (6/12/전체, URL 파라미터) | ✅ |
| I4 | 연령 분포 시간 비교 (두 시점 오버레이) | ✅ |

**주요 파일:** `src/app/ranking/page.tsx`, `src/components/ranking/RankingClient.tsx`, `src/app/trending/page.tsx`, `src/components/trending/TrendingClient.tsx`, `src/components/ui/RangeToggle.tsx`, `src/components/detail/AgeCompareTab.tsx`, `src/components/detail/AgeChart.tsx`, `src/components/layout/BottomNav.tsx`

---

### Phase 3 — Backlog ✅ 완료 (2026-05-14, N6 제외)

| ID | 기능 | 상태 |
|----|------|------|
| I2 | 인기 지역 동적 산출 (12개월 증가율 TOP 6, 시도별 1개 제한) | ✅ |
| I5 | 비교 지표 확장 (성비·YoY%·고령 인구 비율 추가, 툴팁) | ✅ |
| N5 | 연령 구조 심층 지표 카드 (고령화 지수·생산가능 비율·성비·중위 연령대) | ✅ |
| N6 | 공유 & 내보내기 (URL 복사 · 이미지 저장 · CSV 다운로드) | ⏳ |

**주요 파일:** `src/lib/data.ts` (`getPopularRegions` 동적화), `src/components/compare/CompareClient.tsx`, `src/components/detail/AgeInsightCards.tsx`, `src/components/home/PopularRegions.tsx`

---

## 3. 남은 작업

### N6. 공유 & 내보내기

| 기능 | 상세 |
|------|------|
| URL 복사 | 현재 뷰(지역 + 월)의 URL을 클립보드에 복사 |
| 이미지 저장 | 차트 영역을 PNG로 저장 (html2canvas 활용) |
| CSV 다운로드 | 해당 지역 전체 월별 데이터 CSV 다운로드 |

- 진입: 지역 상세 페이지 우상단 공유 아이콘 → 바텀시트
- **개발 규모** M (2~3일) | **임팩트** Medium
