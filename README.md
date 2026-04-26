# 🇰🇷 Korea Population Dashboard

> 대한민국 주민등록 인구통계를 기반으로 한 고성능 데이터 시각화 대시보드

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-6%20passing-brightgreen?logo=vitest)](./src/lib/csv-parser.test.ts)

---

## 📌 프로젝트 개요

행정안전부(MOIS)가 매월 공개하는 **주민등록 인구 통계 데이터**를 파싱하여,  
대한민국 17개 시도의 인구 변화를 직관적인 차트와 카드로 시각화합니다.

**데이터 출처:** [행정안전부 주민등록 인구통계](https://jumin.mois.go.kr)  
**업데이트 주기:** 매월 말일 기준 (CSV 파일 추가 시 자동 반영)

---

## ✨ 주요 기능

### 📊 데이터 시각화
- **월별 인구 추이** — Nivo 라인 차트로 최대 24개월 시계열 비교 (서울 vs 경기 등)
- **지역별 인구 변동률** — 전년 동월 대비 YoY 변동률 Top 10 수평 바차트
- **남녀 인구 비율** — 시도별 성별 구성 비율 인터랙티브 바

### 🗂️ 핵심 지표 카드
- 총 인구수 (전국/지역 선택)
- 세대수 및 세대당 인구
- 남녀 인구 구성 비율
- 인구 증가율 1위 지역

### 🔍 동적 필터링
- **연도** / **월** / **시도** 필터 — 모든 상태가 URL 파라미터로 동기화
- 링크 공유 시 동일 필터 상태 재현 가능

### 📱 반응형 레이아웃
- **데스크톱:** 사이드바 + 차트 대시보드
- **모바일:** 상단 앱바 + 슬라이드 드로어 + K-Stats 카드 레이아웃

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Nivo (line, bar) |
| State | nuqs (URL query params) |
| Data Parsing | Papaparse + 커스텀 MOIS CSV 파서 |
| Testing | Vitest + Testing Library |
| Fonts | Inter, Space Grotesk (Google Fonts) |
| Deploy | Vercel |

---

## 🚀 로컬 실행

### 사전 요구사항
- Node.js 18+
- npm / yarn / pnpm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 테스트

```bash
npm run test
# 또는
npx vitest run
```

### 빌드

```bash
npm run build
npm run start
```

---

## 📂 프로젝트 구조

```
korea-population-dashboard/
├── public/
│   └── data/                          # MOIS CSV 원본 데이터
│       ├── resident_population_..._202401_202412.csv
│       └── resident_population_..._202501_202512.csv
├── src/
│   ├── app/
│   │   ├── globals.css                # 디자인 토큰, 글래스모피즘 유틸리티
│   │   ├── layout.tsx                 # 폰트, SEO 메타데이터, AdSense
│   │   └── page.tsx                   # 메인 대시보드 페이지 (서버 컴포넌트)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # 데스크톱 사이드바 + 필터
│   │   │   └── MobileHeader.tsx       # 모바일 앱바 + 드로어
│   │   └── dashboard/
│   │       ├── SummaryCards.tsx       # 핵심 지표 4-카드 (데스크톱)
│   │       ├── TotalPopulationCard.tsx # 전체 인구 카드 (모바일)
│   │       ├── CityStatistics.tsx     # 시도별 리스트 (모바일)
│   │       ├── DataComparison.tsx     # 도시 비교 차트 (모바일)
│   │       ├── PopulationTrendChart.tsx # 월별 추이 라인 차트
│   │       └── RegionalShiftChart.tsx # 지역별 변동률 바 차트
│   └── lib/
│       ├── csv-parser.ts              # MOIS CSV 파서 (다중 헤더 처리)
│       ├── csv-parser.test.ts         # 유닛 테스트 (6개)
│       └── data.ts                    # 데이터 로드 및 집계 함수
```

---

## 📁 데이터 파일 추가 방법

행안부에서 새 CSV를 다운로드한 후 `public/data/` 폴더에 위치시키고,  
`src/lib/data.ts`의 `CSV_FILES` 배열에 파일명을 추가합니다.

```ts
// src/lib/data.ts
const CSV_FILES = [
  'resident_population_household_status_202401_202412.csv',
  'resident_population_household_status_202501_202512.csv',
  'resident_population_household_status_202601_202612.csv', // 새 파일 추가
];
```

### CSV 구조 (MOIS 형식)

```
Row 1: 메타데이터 (스킵)
Row 2: 월 헤더 ("2025년01월", "2025년02월", ...)
Row 3: 컬럼 헤더 (행정기관코드, 행정기관, 총 거주자수, 세대수, ...)
Row 4~: 데이터 (시도 → 시군구 순)
```

---

## 🗺️ 향후 로드맵

| 우선순위 | 기능 | 설명 |
|---------|------|------|
| 🔴 High | 시군구 드릴다운 | 시도 클릭 → 시군구 세부 데이터 |
| 🔴 High | 자동 데이터 갱신 | GitHub Action으로 매월 CSV 자동 추가 |
| 🔴 High | AdSense 실 ID 적용 | `ca-pub-XXXX` 및 slot ID 교체 |
| 🟡 Mid | 시도 지도 히트맵 | Nivo Geo로 인구밀도 / 변동률 색상 시각화 |
| 🟡 Mid | 연령별 인구 피라미드 | 5세 단위 연령 분포 차트 |
| 🟡 Mid | 인구 감소 알림 카드 | 전월 대비 큰 변화 자동 하이라이트 |
| 🟢 Low | CSV 다운로드 | 현재 필터 기준 데이터 내보내기 |
| 🟢 Low | 다국어 지원 | 한국어 / 영어 전환 (next-intl) |
| 🟢 Low | 동적 OG 이미지 | SNS 공유 시 차트 미리보기 이미지 생성 |

---

## 🔑 환경 설정

### Google AdSense (선택)

`src/components/layout/Sidebar.tsx` 및 `src/app/layout.tsx`에서 플레이스홀더를 실제 ID로 교체합니다.

```tsx
// Sidebar.tsx
<AdSense client="ca-pub-YOUR_ID" slot="YOUR_SLOT" />

// layout.tsx
src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID"
```

---

## 📄 라이선스

MIT License — 데이터 원본은 [공공누리 제1유형](https://www.kogl.or.kr) 적용

---

<p align="center">
  데이터 출처: <a href="https://jumin.mois.go.kr">행정안전부 주민등록 인구통계</a>
  &nbsp;|&nbsp;
  디자인: <a href="https://stitch.withgoogle.com">Google Stitch</a>
</p>
