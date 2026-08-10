# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # build-data 후 dev 서버 (http://localhost:3000)
npm run build      # build-data 후 프로덕션 빌드
npm run build-data # data/raw/*.csv → public/data/regions/*.json (dev/build 전 자동 실행)
npm run lint       # ESLint
npm run test       # build-data 후 vitest run
```

`src/lib/data.test.ts`가 빌드 산출물을 대상으로 파이프라인 회귀를 지킨다(21개). 각 테스트는 `docs/spec.md` §5 결함 번호에 대응하며, 특히 **전국 합계를 원본 CSV의 MOIS 공식 전국 행과 대조**한다. 집계 로직을 건드렸으면 이 테스트를 먼저 돌린다.

## What This Is

행정안전부(MOIS) 주민등록 인구통계 기반의 서버 렌더링 모바일 대시보드. 부동산 매수·이주 의사결정 리서치가 목적 — 도메인 정의는 `docs/domain.md`. 런타임 외부 API 호출은 없고, 모든 인구 데이터는 사전 빌드된 JSON을 요청마다 디스크에서 읽는다.

## Data Flow

1. `data/raw/`에 MOIS 월간 CSV **3종**이 있으나 파싱 대상은 2종뿐이다.
   - `*_registered_population_and_household_monthly.csv` — 인구·세대 ✅ 파싱
   - `*_population_by_age_monthly.csv` — 연령별 ✅ 파싱
   - `*_other_population_change_monthly.csv` — 월별 인구증감 ❌ **파일만 존재, 파이프라인 미사용**

   세 번째 파일은 이름과 달리 **전입·전출 데이터가 아니다.** 실제 컬럼은 월별 `전월인구수 / 당월인구수 / 인구증감`을 각각 남·여·계로 나눈 것이다. 즉 상세 "전입출" 탭이 인구·세대 CSV에서 계산하는 값과 같은 성격이며, 여기서 추가로 얻을 수 있는 건 **증감의 성별 분해**뿐이다. 진짜 이동자 통계(전입/전출)는 이 저장소에 없다(KOSIS 국내인구이동통계가 별도로 필요).

   다만 이 파일에는 **전국(`1000000000`)·시도 합계 행이 들어 있어 집계 검증용 기준값으로 쓸 수 있다.** 2026.04 전국 = 51,097,986명.
2. `scripts/csv-to-json.ts`(`npm run build-data`)가 시군구별 `public/data/regions/{code}.json`과 전체 목록 `index.json`을 생성
3. `src/lib/data.ts`가 요청 시점에 `fs.readFileSync`로 읽고 집계(`getRegionDetail`, `getAllRegionRankings`, `getSidoStats` 등). 프로세스 메모리 캐시는 `index.json`과 일부 파생 결과뿐
4. 데이터 페이지(`ranking`, `compare`, `[sido]/[sigungu]`, `.../detail`)는 async Server Component로 `await props.searchParams`(Next.js 16 패턴) 후 `data.ts`를 직접 호출 — **데이터용 API 라우트 없음**. 유일한 라우트 `src/app/api/og/route.tsx`는 OG 이미지 생성용
5. 필터 상태(월·정렬·선택 지역·비교 범위)는 전부 URL 쿼리 파라미터(`nuqs` / searchParams)

생성된 JSON은 git에 커밋된다. `build-data`가 매번 출력 디렉터리를 비우고 다시 쓰므로, 행정구역 개편으로 사라진 코드의 JSON이 남지 않는다.

## ⚠️ 집계 단위 — 새 집계 함수를 쓰기 전에 반드시 읽을 것

`index.json`의 268개 엔트리는 동일한 행정 단위가 아니다. `Region.level`이 이를 구분한다.

| `level` | 개수 | 의미 |
|---|---|---|
| `'sigungu'` | 229 | 최상위 시군구. **합계·순위의 유일한 기준 집합** |
| `'district'` | 39 | 일반구(예: `경기도 수원시 장안구`). 부모 시에 이미 포함되어 있다 |

**규칙 하나:** 전국·시도 **합계**와 **순위**는 반드시 `getTopLevelRegions()`를 쓴다. `getAllRegions()`는 검색·비교처럼 "지역을 고르는" 용도 전용이다.

필터링은 `data.ts`의 `getTopLevelRegions()` 한 곳에서만 정의한다. 각 함수가 개별로 거르기 시작하면 반드시 어긋난다 — 실제로 이 혼재 때문에 홈 전국 총인구가 20.6% 부풀려져 있었다(2026-08-10 해소, `docs/spec.md` D1).

**검증 기준값:** `data/raw/*_other_population_change_monthly.csv`에 MOIS 공식 전국·시도 합계 행이 들어 있다(2026.04 전국 51,097,986명). 집계 로직을 바꿨으면 이 값과 대조한다. 현재 최상위 합계는 50,879,765명으로 -0.43% 차이인데, 이는 두 CSV의 집계 정의 차이이며 정상 범위다.

일반구는 삭제하지 않는다. KOSIS가 시도에서 멈추므로 분당구·영통구 해상도가 이 서비스의 차별점이다(`docs/principles.md` 0-2). 검색·비교·지역 상세에서는 1급 지역이고, 부모 시 상세의 "구별 현황" 섹션(`getChildDistricts()`)이 드릴다운 경로다.

## Region Code Hierarchy

10자리 MOIS 코드. `00000000`으로 끝나는 시도(17개) 행은 `csv-to-json.ts`가 제외하고 그 아래 단위만 남긴다. 앞 2자리가 시도 prefix.

- **세종특별자치시**는 하위 시군구가 없어 접두사 제거 후 `sigungu`가 빈 문자열이 된다. 빌드 시 시도명으로 채워 `/세종특별자치시/세종특별자치시`로 접근한다.
- **일반구 판별**은 두 조건을 모두 만족할 때만이다 — ① 부모 코드(앞 4자리 + `000000`)가 목록에 존재하고 ② 자기 이름이 `<부모명> `으로 시작. ①만 쓰면 영동군(`4374000000`)과 증평군(`4374500000`)처럼 코드 앞자리만 우연히 겹치는 별개 지역을 잘못 묶는다.
- `LEGACY_CODE_MAP`이 개편 전후 코드를 병합해 시계열 연속성을 유지한다 — 강원(42xx→51xx, 2023.06), 전북(45xx→52xx, 2024.01), 군위군(`4772000000`→`2772000000`, 2023.07 경북→대구).
- **새 개편이 공표되면 매핑 추가가 데이터 갱신 절차의 일부다.** 누락하면 구 코드 지역이 개편 시점에 멈춘 유령 지역으로 남는다. `build-data`가 최상위 시군구 수를 기대값(229)과 비교해 경고하니 그 경고를 무시하지 말 것.

## CSV Parsing Quirks

`scripts/csv-to-json.ts`를 고칠 때만 해당된다 — 빌드/개발 시점에만 실행되고 런타임에는 돌지 않는다. 두 CSV의 헤더 깊이가 다르다.

- 인구·세대 CSV: 1행 메타데이터, 2행 월 헤더(컬럼마다 반복), 3행 컬럼 타입 헤더, **4행부터** 데이터. 월당 5개 컬럼(총인구·세대수·세대당인구·남자·여자)
- 연령별 CSV: 앞 3행은 동일하나 **5행부터** 데이터(헤더가 한 줄 더 있음). 5세 단위 원본을 10세 단위 9개 버킷으로 재집계

`splitCSVLine()`이 따옴표 안의 콤마(`"1,234,567"`)를 처리하고, `parseNum()`이 콤마를 제거한다.

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
- `docs/spec.md` — 살아있는 기능 명세(페이지·컴포넌트·데이터 함수) + §5 알려진 결함 D1~D13
- `docs/backlog.md` — P0~P3 우선순위, 신규 서비스 후보
- `docs/benchmark-kosis.md` — 통계청 KOSIS 대비 벤치마킹 결론

**한 줄 요약:** 이 서비스는 통계를 더 많이 보여주는 방향이 아니라, 같은 통계에서 더 분명한 **판단**을 뽑는 방향으로 간다. 지표 추가 제안은 `domain.md` §7 필터를 먼저 통과시킬 것.

## Path Aliases

`@/*` → `./src/*` (`tsconfig.json`, `vitest.config.mjs`에 동일 설정)
