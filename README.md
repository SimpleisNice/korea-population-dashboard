# Korea Population Dashboard

대한민국 행정안전부(MOIS) 주민등록 인구통계를 기반으로 한 모바일 최적화 데이터 시각화 서비스

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://korea-population-dashboard.vercel.app)

---

## 개요

부동산 구매·이주 검토 전 시군구별 인구 현황을 한눈에 확인할 수 있는 서비스입니다.  
인구 추이, 세대수, 연령 구조, 월별 인구 증감을 제공합니다.

**데이터 출처:** [행정안전부 주민등록 인구통계](https://jumin.mois.go.kr)  
**데이터 범위:** 2023.01~2026.07 (43개월)  
**업데이트 주기:** 매월 말일 기준 (수동 갱신)  
**집계 단위:** 현행 최상위 시군구 230개 + 일반구 39개. 합계·순위는 최상위 230개만 사용합니다

KOSIS 인구상황판이 전국·17개 시도에서 멈추는 데 반해, 이 서비스는 **시군구 단위**를 같은 기준으로 비교합니다. 지표를 많이 나열하는 대신 각 지역 화면 맨 위에 "그래서 어떤 지역인가"를 한 문장으로 제시합니다.

---

## 주요 기능

- **지역 검색** — 시군구 이름으로 즉시 검색 (퍼지 검색 지원)
- **한 줄 판정** — 인구 추세·연령 구조·세대 분화를 종합한 지역별 결론 한 문장
- **인구 추이** — 월별 인구 변화 라인 차트 + 6개월 선형 추세 연장(참고용)
- **연령 구조** — 10세 단위 연령별 인구 분포 차트
- **지역 순위 · 트렌딩** — 총인구·증감·증감률 정렬, 급증·급감 TOP 10
- **인구 지도** — 17개 시도 전년 동월 대비 증감 choropleth
- **지역 비교** — 2개 시군구 8개 지표 나란히 비교
- **구별 현황** — 일반구가 있는 시에서 구 단위로 드릴다운
- **기준월 선택** — 과거 월 데이터 열람 가능

> 연령 지표는 원본이 10세 단위로 제공되어 통계청 공식 정의(65세/15세 경계)를 만들 수 없습니다. 그래서 **공식 지표명을 쓰지 않습니다** — "노령화지수"가 아니라 "고령화 지수"(60세+ ÷ 0~19세)입니다. 자세한 정의는 서비스 내 `/methodology`에 있습니다.

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

`dev`·`build`·`test` 스크립트는 모두 CSV → JSON 변환(`build-data`)을 자동 선행합니다.

### 테스트

```bash
npm run test    # build-data + vitest run (67개)
npx vitest run  # build-data 없이 실행
```

| 파일 | 개수 | 지키는 것 |
|---|---:|---|
| `scripts/lib/mois-csv.test.ts` | 31 | CSV 파싱 규칙 (고정 입력) |
| `src/lib/data.test.ts` | 28 | 빌드 산출물 회귀 |
| `src/lib/region-narrative.test.ts` | 8 | 지역 서술 다양성 |

집계 로직이나 파서를 수정했다면 이 테스트를 먼저 실행하세요.

### 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 프로젝트 구조

```
korea-population-dashboard/
├── data/
│   └── raw/                  # MOIS 원본 CSV 2종 (인구·세대 / 연령별). git 커밋됨
├── public/
│   ├── data/
│   │   └── regions/          # JSON 데이터 (build-data 산출물, 269개 파일). git 커밋됨
│   └── ads.txt               # Google AdSense 공인 판매자 선언
├── scripts/
│   ├── csv-to-json.ts        # MOIS CSV → JSON 변환 (빌드 시점 전용)
│   ├── check-raw.ts          # 원본 CSV 검사 (npm run check-raw)
│   └── lib/
│       ├── mois-csv.ts       # 순수 파싱 함수 (단위 테스트 대상)
│       └── region-codes.ts   # 시도 prefix · 행정구역 개편 매핑
├── docs/                     # 도메인·원칙·명세·백로그 (아래 「문서」 참조)
├── src/
│   ├── app/
│   │   ├── page.tsx                          # 홈 (검색, 인기/최근 지역, 월간 요약)
│   │   ├── [sido]/[sigungu]/page.tsx         # 지역 요약 (한 줄 판정 + 5문단 분석)
│   │   ├── [sido]/[sigungu]/detail/page.tsx  # 지역 상세 (추이·세대·연령·증감 탭)
│   │   ├── ranking/page.tsx                  # 지역 순위
│   │   ├── trending/page.tsx                 # 급증·급감 TOP 10
│   │   ├── map/page.tsx                      # 시도 choropleth (noindex)
│   │   ├── compare/page.tsx                  # 지역 비교 (noindex)
│   │   ├── about · methodology · privacy/    # 정적 콘텐츠
│   │   ├── api/og/route.tsx                  # OG 이미지 생성 (유일한 API 라우트)
│   │   ├── layout.tsx                        # 폰트·메타데이터 (광고 스크립트 없음)
│   │   ├── sitemap.ts                        # 동적 sitemap.xml
│   │   └── robots.ts                         # robots.txt
│   ├── components/
│   │   ├── AdSlot.tsx            # AdSense 광고 슬롯 + adsbygoogle.js 로드
│   │   ├── detail/               # 상세 탭, 연령 차트, 변화 차트
│   │   ├── home/                 # 검색창, 인기 지역, 최근 지역, 월간 브리핑
│   │   ├── layout/               # MobileShell, Header, BottomNav, Footer
│   │   ├── region/               # StatCard, TrendChart, YoYBarChart, VerdictCard
│   │   └── ui/                   # MonthPicker, AnimatedNumber 등 공용 컴포넌트
│   └── lib/
│       ├── data.ts               # JSON 데이터 로드 및 집계 함수
│       ├── region-narrative.ts   # 수치에서 판정·서술 생성
│       ├── types.ts              # 공용 타입 정의
│       ├── actions.ts            # Server Actions
│       ├── site.ts               # SITE_URL 단일 출처
│       ├── sido-map.ts           # SVG 지도 id ↔ 시도명 (테스트로 고정)
│       └── utils.ts              # 유틸리티 함수
```

**데이터용 API 라우트는 없습니다.** 집계는 Server Component 안에서 `src/lib/data.ts`가 `fs`로 직접 읽습니다. `api/og`만 예외입니다.

---

## 데이터 업데이트 방법

1. [행안부 주민등록 인구통계](https://jumin.mois.go.kr)에서 **주민등록인구및세대현황**·**연령별인구현황** 월간 CSV 다운로드 (연령은 **10세 단위**로)
2. `data/raw/`에 파일을 그대로 넣는다 — 스크립트가 디렉터리를 스캔하므로 경로를 코드에 추가할 필요는 없다
3. `npm run check-raw` → 파일 인식·월 커버리지·연령 구간·읍면동 혼입을 빌드 전에 검사
4. `npm run build-data` → `public/data/regions/` 갱신
5. **출력을 확인한다** — 현행 최상위 시군구 230, 최신월 갱신 여부, 그리고 **전국 합계가 시도 합계 행과 일치하는지**
6. `npm run test` (67개) → 변경된 JSON 커밋 후 배포

### 행정구역 개편이 있으면

개편은 3년 반 동안 6번 있었습니다. 매핑 추가는 갱신 절차의 일부입니다 — 누락하면 해당 지역이 개편 시점에 멈춘 유령 지역으로 남습니다.

`scripts/lib/region-codes.ts`를 고칩니다.

| 개편 종류 | 처리 |
|---|---|
| **통합·개칭** (강원도→강원특별자치도, 광주+전남→전남광주통합특별시) | `LEGACY_CODE_MAP`에 구 코드 → 신 코드. **부모 시를 옮기면 그 일반구도 함께** 옮겨야 합니다 |
| **분할** (인천 중구+동구→제물포구+영종구) | 병합할 수 없습니다. `SPLIT_SUCCESSORS`에 승계 관계만 기록하면 구 지역은 이력을 유지한 채 폐지 표기됩니다 |
| **새 시도 신설** | `SIDO_BY_PREFIX`에 prefix 추가. 빠뜨리면 빌드가 중단됩니다 |

빌드가 알려줍니다 — 알 수 없는 시도 prefix면 **중단**, 최신월 데이터가 없는 미선언 지역이나 시군구 수 불일치는 **경고**.

---

## 환경 변수

`.env.local` 파일을 생성하고 아래 값을 설정합니다. 모두 선택 사항이며, 미설정 시 동작은 표에 있습니다.  
Vercel 배포 시에는 대시보드 → Settings → Environment Variables에도 동일하게 등록해야 합니다.

```
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxx
```

| 변수 | 용도 | 미설정 시 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical·OG·sitemap·robots URL | `src/lib/site.ts`의 도메인으로 폴백 |
| `NEXT_PUBLIC_ADSENSE_SLOT_BANNER` | 광고 슬롯 ID | `AdSlot`이 `null` 반환 (광고 미노출) |
| `NEXT_GOOGLE_SITE_VERIFICATION` | Search Console 인증 | 메타 태그 생략 |

AdSense 퍼블리셔 ID는 환경 변수가 아니라 `src/components/AdSlot.tsx`와 `public/ads.txt`에 하드코딩되어 있습니다.

---

## 문서

| 문서 | 내용 |
|---|---|
| [docs/domain.md](docs/domain.md) | 도메인 정의, KOSIS 대비 포지셔닝, 신규 기능 판단 기준 5단계 |
| [docs/principles.md](docs/principles.md) | 원리·원칙. §0 제품 원칙이 나머지보다 우선 |
| [docs/spec.md](docs/spec.md) | 페이지·컴포넌트·데이터 함수 명세 + 알려진 결함 D1~D15 |
| [docs/backlog.md](docs/backlog.md) | 우선순위와 신규 서비스 후보 |
| [docs/benchmark-kosis.md](docs/benchmark-kosis.md) | 통계청 KOSIS 대비 벤치마킹 결론 |
| [CLAUDE.md](CLAUDE.md) | 코드 작업 시 지침 (집계 단위 함정, CSV 파싱) |

---

## 라이선스

MIT License — 데이터 원본은 [공공누리 제1유형](https://www.kogl.or.kr) 적용
