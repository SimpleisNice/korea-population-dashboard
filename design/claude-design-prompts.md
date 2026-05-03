# Claude 디자인 프롬프트 — 인구통계 서비스

> **사용 방법**
> 각 `## PROMPT` 블록을 통째로 복사하여 Claude 디자인에 붙여넣기.
> 공통 토큰(색상·폰트·스페이싱)이 각 프롬프트 안에 포함되어 있어 독립 실행 가능.

---

## PROMPT 00 — 디자인 시스템 (가장 먼저 생성)

```
한국 부동산 인구통계 모바일 앱의 디자인 시스템을 만들어줘.

## 서비스 성격
부동산 구매를 검토하는 사람이 시군구(행정구역)의 인구 통계를 빠르게 파악하는 데이터 대시보드.
신뢰감 있는 금융·데이터 서비스 느낌. 라이트 모드 전용.

## 컬러 토큰
- Background: #FFFFFF (카드, 입력창)
- Surface: #F8F9FA (페이지 배경, 탭 영역)
- Border: #E5E7EB
- Text Primary: #111827
- Text Secondary: #6B7280
- Accent (Blue): #2563EB — CTA, 링크, 차트 주색
- Accent Light: #EFF6FF — Accent 계열 배경
- Positive (Green): #16A34A — 인구 증가
- Positive Light: #F0FDF4
- Negative (Red): #DC2626 — 인구 감소
- Negative Light: #FEF2F2
- Compare B (Violet): #7C3AED — 비교 페이지 B 지역 전용

## 타이포그래피 (Pretendard)
- Stat Large: 28px / Bold — 총인구 같은 핵심 수치
- Stat Medium: 20px / SemiBold — 보조 수치
- Title: 16px / SemiBold — 섹션 제목
- Body: 14px / Regular
- Label: 12px / Medium / Text Secondary — 수치 위 레이블
- Caption: 11px / Regular / Text Secondary — 차트 축

## 컴포넌트 목록 (모두 표시)
1. StatCard — 수치 카드 (레이블 + 큰 수치 + 증감 배지)
   - 증감 배지: ▲ +1,200 (green) / ▼ -800 (red) / – 0 (gray)

2. SearchBar — 검색창
   - 기본: 테두리 #E5E7EB, 돋보기 아이콘
   - 포커스: 테두리 #2563EB, 외부 glow #EFF6FF 3px

3. RegionChip — 지역 선택 칩 (pill 형태)
   - 기본: 테두리 #E5E7EB, bg white
   - hover/selected: 테두리 #2563EB, 텍스트 #2563EB

4. TabBar — 4개 탭 (인구추이 / 세대 / 연령 / 전입출)
   - 탭 컨테이너: bg #F8F9FA, radius 12px, padding 4px
   - 선택된 탭: bg white, text #2563EB, card shadow
   - 기본 탭: bg transparent, text #6B7280

5. Header — 상단 내비게이션 바 (56px)
   - 좌: 뒤로가기 아이콘 버튼 (40×40px)
   - 중: 페이지 제목 (16px SemiBold, 중앙 정렬)
   - 우: 검색 + 비교 아이콘 버튼

6. AdSlot — 광고 영역 자리표시자
   - 높이 60px, 점선 테두리 #E5E7EB, "광고" 레이블 중앙

카드 공통 스펙: border-radius 12px, bg white, shadow(0 1px 3px rgba(0,0,0,0.08))
모바일 최대 너비: 430px
```

---

## PROMPT 01 — 홈 화면

```
한국 인구통계 모바일 앱 홈 화면을 디자인해줘. (430px 너비 기준)

## 디자인 방향
라이트 미니멀. 데이터 대시보드 느낌. 신뢰감 있는 금융 서비스 스타일.

## 컬러
- 배경: #F8F9FA
- 카드/입력창: #FFFFFF
- 텍스트: #111827 (primary), #6B7280 (secondary)
- Accent: #2563EB
- 테두리: #E5E7EB

## 화면 구성 (위에서 아래 순서)

**1. 상단 로고 영역** (px-16, pt-24)
  - "인구통계" — 20px Bold #111827
  - "부동산 구매 전 꼭 확인하는 시군구 인구 현황" — 14px Regular #6B7280

**2. 검색창** (mt-32, height 48px)
  - 테두리 1px #E5E7EB, radius 12px, bg white
  - 좌: 돋보기 아이콘 18px #6B7280
  - placeholder: "시군구 검색 (예: 강남구, 분당구)" #6B7280
  - 우: 빈 공간 (입력 시 X 버튼 등장)

  자동완성 드롭다운 상태도 함께 표시:
  - radius 12px, border 1px #E5E7EB, bg white, shadow
  - 항목: "강남구" (14px Bold #111827) + "서울특별시" (12px #6B7280)
  - 항목 높이 48px, hover bg #F8F9FA

**3. 인기 지역** (mt-24)
  - 레이블: "인기 지역" 12px Medium #6B7280
  - Pill 칩 목록 (flex-wrap, gap 8px):
    강남구 / 송파구 / 성남시 분당구 / 마포구 / 해운대구 / 화성시
  - 칩: height 32px, padding 6px 12px, radius 9999px
    테두리 1px #E5E7EB, bg white, 14px Medium #111827

**4. 최근 본 지역** (mt-24)
  - 레이블: 🕐 "최근 본 지역" 12px Medium #6B7280
  - 리스트 카드: border 1px #E5E7EB, radius 12px, overflow hidden
  - 각 행 (height 48px, px-16):
    "마포구" (14px Medium #111827) + "서울특별시" (12px #6B7280) + "→" (#2563EB)
    행 사이 border-b 1px #E5E7EB

상태 2가지를 한 화면에:
- 왼쪽: 검색창 기본 상태 + 인기 지역 + 최근 본 지역 있는 상태
- 오른쪽: 검색창 포커스 + 자동완성 드롭다운 표시 상태
```

---

## PROMPT 02 — 지역 통계 메인 화면

```
한국 인구통계 모바일 앱의 "지역 통계 메인" 화면을 디자인해줘. (430px 너비 기준)
예시 지역: 서울특별시 강남구, 기준: 2025년 4월

## 컬러
- 배경: #F8F9FA
- 카드: #FFFFFF, radius 12px, shadow(0 1px 3px rgba(0,0,0,0.08))
- 텍스트: #111827 / #6B7280
- Accent: #2563EB / Accent Light: #EFF6FF
- Positive: #16A34A / Negative: #DC2626

## 화면 구성 (위에서 아래)

**Header (56px, bg white, border-b #E5E7EB, sticky)**
  좌: ← 뒤로가기 (40×40px 원형 터치영역)
  중: "강남구" (16px SemiBold #111827)
  우: 🔍 검색 아이콘 | ⇄ 비교 아이콘 (#2563EB)

**기준 텍스트** (px-16, mt-20)
  "서울특별시 · 2025년 4월 기준" — 12px Regular #6B7280

**StatCard 1행** (mt-16, gap-12)
  카드 2개 나란히 (각 flex-1):
  ┌───────────┐  ┌───────────┐
  │ 총 인구   │  │ 세대수    │
  │ 542,000   │  │ 241,000   │
  │ ▼ 1,200   │  │ ▲ 320     │
  │ 전월비    │  │ 전월비    │
  └───────────┘  └───────────┘
  - 레이블: 12px Medium #6B7280 (카드 상단)
  - 수치: 28px Bold #111827
  - 증감: 12px / ▼ red #DC2626 / ▲ green #16A34A + "전월비"

**StatCard 2행** (mt-12, gap-12)
  ┌───────────┐  ┌───────────────┐
  │ 세대당 인구│  │ 성비 (남/여) │
  │ 2.25명    │  │261k / 281k   │
  └───────────┘  └───────────────┘
  - 수치: 20px SemiBold (Stat Medium)
  - 증감 배지 없음

**인구 추이 차트 카드** (mt-20)
  - 제목: "인구 추이 (최근 12개월)" 14px SemiBold
  - Line Chart 높이 208px
    - X축: 2024.05 ~ 2025.04 (양끝 레이블만)
    - Y축: 53만 ~ 55만 (n만 단위), 36px 너비
    - 격자: 수평선만, #E5E7EB dashed
    - 선: #2563EB, strokeWidth 2, 완만하게 우하향
    - 툴팁: "2025.04 / 542,000명" (radius 8, border #E5E7EB)

**상세보기 버튼** (mt-20)
  - bg #EFF6FF, radius 12px, padding 16px
  - 좌: "세대·연령·전입출 상세 정보" 14px Medium #2563EB
  - 우: "→" #2563EB

**광고 슬롯** (mt-20)
  - 60px, 점선 1px #E5E7EB, radius 8px, "광고" 12px #6B7280 중앙
```

---

## PROMPT 03 — 상세 페이지

```
한국 인구통계 모바일 앱의 "지역 상세 정보" 화면을 디자인해줘. (430px 너비 기준)
예시: 서울특별시 강남구 상세 — 탭 4개 (인구추이 / 세대 / 연령 / 전입출)

## 컬러
- 배경: #F8F9FA
- 카드: #FFFFFF, radius 12px, shadow(0 1px 3px rgba(0,0,0,0.08))
- 텍스트: #111827 / #6B7280
- Accent: #2563EB
- Positive: #16A34A / Negative: #DC2626

## 화면 구성

**Header (56px)**
  좌: ← 뒤로가기
  중: "강남구 상세" (16px SemiBold)
  우: 🔍

**기준 텍스트**
  "서울특별시 · 2025년 4월 기준" — 12px #6B7280

**탭 바**
  컨테이너: bg #F8F9FA, radius 12px, padding 4px, 4개 탭 균등 배분
  ┌────────────────────────────────────┐
  │ [인구추이] │  세대  │  연령  │전입출│
  └────────────────────────────────────┘
  - 선택 탭 (인구추이): bg white, text #2563EB, shadow, radius 8px
  - 기본 탭: bg transparent, text #6B7280, 12px Medium

**탭 1 — 인구추이 (선택된 상태)**
  카드 내:
  - 제목: "월별 인구 추이" 14px SemiBold
  - Line Chart 208px (#2563EB 선)
  - 하단 테이블 (6행):
    헤더: 기준월 | 인구 | 증감 (12px #6B7280)
    데이터 행: 2025.04 | 542,000 | ▼ -1,200
    행 border-b #E5E7EB, py-6

**탭 2 — 세대 (비선택 미리보기)**
  StatCard 2개 (세대수 + 세대당인구) + 세대수 Line Chart (green #16A34A)

**탭 3 — 연령 (비선택 미리보기)**
  Horizontal Bar Chart
  - Y축: 0-9, 10-19, 20-29, ... 80+
  - 남자(#2563EB) / 여자(#F97316) 나란히
  - Legend: 남자 ■ 여자 ■

**탭 4 — 전입출 (비선택 미리보기)**
  Multi-line Chart 3선:
  - 전입: #16A34A (실선)
  - 전출: #DC2626 (실선)
  - 순이동: #2563EB (점선)
  - Legend 표시

4개 탭을 모두 1개 화면에 보여줘 (스크롤 형태 or 4분할):
위쪽에 탭 바 + 인구추이 탭 선택 상태를 크게,
아래쪽에 나머지 3개 탭 내용을 작게 미리보기.
```

---

## PROMPT 04 — 비교 화면

```
한국 인구통계 모바일 앱의 "지역 비교" 화면을 디자인해줘. (430px 너비 기준)
A: 서울 강남구 (#2563EB) vs B: 경기 성남시 분당구 (#7C3AED)

## 컬러
- 배경: #F8F9FA
- 카드: #FFFFFF, radius 12px
- 지역 A: #2563EB (Blue)
- 지역 B: #7C3AED (Violet)
- 텍스트: #111827 / #6B7280
- 테두리: #E5E7EB

## 화면 구성

**Header (56px)**
  좌: ← 뒤로가기
  중: "지역 비교" (16px SemiBold)
  우: 🔍

**지역 선택기 — 선택 완료 상태**

  지역 A 칩 (border 1px #2563EB, radius 12px, px-16 py-12):
  ┌──────────────────────────────────────┐
  │ [A] 강남구  서울특별시           ×   │  ← border #2563EB
  └──────────────────────────────────────┘
  [A] 배지: 20×20 원형, bg #2563EB, 텍스트 white, 12px Bold

  지역 B 칩 (border 1px #7C3AED):
  ┌──────────────────────────────────────┐
  │ [B] 성남시 분당구  경기도        ×   │  ← border #7C3AED
  └──────────────────────────────────────┘
  [B] 배지: bg #7C3AED

**컬럼 헤더 행** (mt-16, text-center)
  강남구(#2563EB SemiBold) | (공백) | 성남시 분당구(#7C3AED SemiBold)

**지표 비교 카드**
  border 1px #E5E7EB, radius 12px, px-16
  3열 grid: [A 수치] [레이블] [B 수치]

  542,000  |  총 인구  |  461,000
  241,000  |  세대수   |  188,000
     2.25  |  세대당인구|     2.44
  261,000  |  남자     |  224,000
  281,000  |  여자     |  237,000

  - A 수치: text-right, #2563EB, 14px SemiBold
  - 레이블: text-center, 12px #6B7280
  - B 수치: text-left, #7C3AED, 14px SemiBold
  - 행 사이 border-b #E5E7EB (마지막 행 제외), py-12

**인구 추이 비교 차트 카드** (mt-20)
  제목: "인구 추이 비교" 14px SemiBold
  Line Chart 208px
  - 강남구(A): #2563EB 실선, strokeWidth 2
  - 분당구(B): #7C3AED 점선(4 2), strokeWidth 2
  - Legend: ─ 강남구  ╌ 성남시 분당구

**미선택 상태도 함께 표시**
  B 미선택 시:
  ┌──────────────────────────────────────┐
  │ [B] 지역 B 검색                   🔍 │  ← 검색창 스타일
  └──────────────────────────────────────┘
  + 빈 상태 카드: "두 지역을 선택하면 비교 결과가 나타납니다" 14px #6B7280 중앙

두 상태를 나란히 배치: 왼쪽=미선택 상태, 오른쪽=완전 선택 상태.
```

---

## PROMPT 05 — 빈 상태 & 에러 화면

```
한국 인구통계 모바일 앱의 빈 상태(Empty State)와 에러 화면을 디자인해줘.

## 컬러
- 배경: #F8F9FA
- 카드: #FFFFFF
- 텍스트: #111827 / #6B7280
- Accent: #2563EB

## 화면 3가지를 한 화면에 나란히 배치

**1. 404 — 찾을 수 없는 지역**
  중앙 정렬 레이아웃:
  - 🗺️ 일러스트 or 아이콘 (64px, #E5E7EB 계열)
  - "찾을 수 없는 지역입니다" — 16px SemiBold #111827
  - "URL을 확인하거나 검색을 이용해주세요" — 14px #6B7280
  - [홈으로 돌아가기] 버튼: bg #2563EB, text white, radius 12px, py-14 px-24

**2. 검색 결과 없음**
  검색창 아래 드롭다운 영역:
  - 🔍 아이콘 (32px, #E5E7EB)
  - "검색 결과가 없습니다" — 14px #6B7280
  (드롭다운이 표시되지 않는 조용한 처리)

**3. 비교 지역 미선택**
  카드 내 중앙:
  - ⇄ 아이콘 (48px, #E5E7EB)
  - "두 지역을 선택하면" — 14px SemiBold #111827
  - "비교 결과가 나타납니다" — 14px #6B7280
```

---

## 공통 주의사항 (모든 프롬프트 적용)

- **폰트:** Pretendard 또는 시스템 산세리프 (Apple SD Gothic Neo, Noto Sans KR)
- **터치 타겟:** 최소 44×44px
- **그림자:** 카드는 `0 1px 3px rgba(0,0,0,0.08)` — 너무 강하지 않게
- **반올림:** 카드 radius 12px, 칩 radius 9999px, 버튼 radius 12px
- **간격:** 8의 배수 기준 (8 / 16 / 24 / 32px)
- **장식 최소화:** 아이콘은 Lucide 스타일(선형, stroke-width 2), 그라디언트 없음
- **한글 표기:** 모든 UI 텍스트는 한국어. 숫자는 천 단위 쉼표 (`542,000`)
