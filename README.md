# Korea Population Dashboard

대한민국 행정안전부(MOIS) 주민등록 인구통계를 기반으로 한 모바일 최적화 데이터 시각화 서비스

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://korea-population-dashboard.vercel.app)

---

## 개요

부동산 구매 전 시군구별 인구 현황을 한눈에 확인할 수 있는 서비스입니다.  
인구 추이, 세대수, 연령 구조, 전입출 현황을 제공합니다.

**데이터 출처:** [행정안전부 주민등록 인구통계](https://jumin.mois.go.kr)  
**업데이트 주기:** 매월 말일 기준

---

## 주요 기능

- **지역 검색** — 시군구 이름으로 즉시 검색 (퍼지 검색 지원)
- **인구 추이** — 월별 인구 변화 라인 차트
- **연령 구조** — 5세 단위 연령별 인구 분포 차트
- **지역 비교** — 최대 2개 시군구 인구 지표 비교
- **기준월 선택** — 과거 월 데이터 열람 가능

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Search | Fuse.js |
| State | nuqs (URL query params) |
| Data | 정적 JSON (빌드 시 CSV → JSON 변환) |
| Testing | Vitest |
| Deploy | Vercel |

---

## 로컬 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

`dev` 스크립트는 빌드 전 CSV → JSON 변환(`build-data`)을 자동 실행합니다.

### 테스트

```bash
npm run test
```

### 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 프로젝트 구조

```
korea-population-dashboard/
├── public/
│   ├── data/
│   │   └── regions/          # JSON 데이터 (빌드 시 자동 생성, 약 270개 파일)
│   └── ads.txt               # Google AdSense 공인 판매자 선언
├── scripts/
│   └── csv-to-json.ts        # MOIS CSV → JSON 변환 스크립트
├── src/
│   ├── app/
│   │   ├── page.tsx                          # 홈 (검색, 인기/최근 지역)
│   │   ├── [sido]/[sigungu]/page.tsx         # 지역 요약 페이지
│   │   ├── [sido]/[sigungu]/detail/page.tsx  # 지역 상세 페이지
│   │   ├── compare/page.tsx                  # 지역 비교 페이지
│   │   ├── layout.tsx                        # 폰트, AdSense 스크립트
│   │   ├── sitemap.ts                        # 동적 sitemap.xml
│   │   └── robots.ts                         # robots.txt
│   ├── components/
│   │   ├── ads/AdSlot.tsx        # AdSense 광고 슬롯 (IntersectionObserver 지연 로딩)
│   │   ├── detail/               # 상세 탭, 연령 차트, 변화 차트
│   │   ├── home/                 # 검색창, 인기 지역, 최근 지역
│   │   ├── layout/               # MobileShell, Header, BottomNav
│   │   ├── region/               # StatCard, TrendChart, TimePeriodCompare
│   │   └── ui/                   # MonthPicker 등 공용 컴포넌트
│   └── lib/
│       ├── data.ts               # JSON 데이터 로드 및 집계 함수
│       ├── types.ts              # 공용 타입 정의
│       ├── actions.ts            # Server Actions
│       └── utils.ts              # 유틸리티 함수
```

---

## 데이터 업데이트 방법

1. [행안부 주민등록 인구통계](https://jumin.mois.go.kr)에서 최신 CSV 다운로드
2. 프로젝트 루트의 `scripts/csv-to-json.ts`에 파일 경로 추가
3. `npm run build-data` 실행 → `public/data/regions/` JSON 파일 갱신
4. 변경된 JSON 파일 커밋 후 배포

---

## 환경 변수

`.env.local` 파일을 생성하고 아래 값을 설정합니다.  
Vercel 배포 시에는 대시보드 → Settings → Environment Variables에도 동일하게 등록해야 합니다.

```
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxx
```

---

## 라이선스

MIT License — 데이터 원본은 [공공누리 제1유형](https://www.kogl.or.kr) 적용
