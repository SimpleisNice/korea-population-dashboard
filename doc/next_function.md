# 추가 기능 개발 예정 목록

## 1. 상세 페이지 → 비교 페이지 이동 시 params 기본 셋팅

현재 상태: `/[sido]/[sigungu]/page.tsx`에서 비교 버튼 클릭 시 `region_a`만 셋팅된 채로 이동함.

구현 내용:
- 상세 페이지(또는 비교 버튼이 있는 모든 화면)에서 비교 페이지로 이동할 때, 현재 보고 있는 지역 코드를 `region_a` 또는 `region_b`로 자동 셋팅
- 이미 한 지역이 선택된 비교 페이지에서 다른 지역 상세 보기 → 비교 버튼 클릭 시 나머지 슬롯(`region_b`)으로 자동 채워지도록 처리

관련 파일:
- `src/app/[sido]/[sigungu]/page.tsx` — compareUrl 생성 로직
- `src/app/compare/page.tsx` — searchParams 수신 및 초기값 세팅

---

## 2. 비교 페이지 광고 노출 조건 완화

현재 상태: `region_a && region_b` 두 지역 모두 선택 시에만 광고 노출.

구현 내용:
- `region_a || region_b` — 하나의 키값이라도 있는 경우 광고 노출로 조건 완화
- 비교 콘텐츠가 없어도(한 지역만 선택된 상태) 광고 게재 허용

관련 파일:
- `src/app/compare/page.tsx` — `{initialA && initialB && <AdSlot />}` 조건 수정
