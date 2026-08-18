/**
 * SVG 지도 도형 id → 현행 시도명
 *
 * `KoreaHeatmap` 이 쓰는 값이지만 클라이언트 컴포넌트 밖에 둔다.
 * 시도명이 개편되면 여기가 `getSidoStats()` 와 어긋나는데, 그때 증상이
 * "그 지역만 회색"이라 화면만 봐서는 알아채기 어렵다 — 테스트로 고정하려면
 * 순수 모듈이어야 한다 (docs/principles.md B1).
 *
 * 2026.07 개편으로 광주광역시와 전라남도가 전남광주통합특별시로 합쳐졌다.
 * SVG 는 여전히 두 도형을 따로 그리므로 둘을 같은 시도에 매핑한다 —
 * 두 도형이 같은 색·같은 수치를 갖고, 클릭하면 같은 순위 화면으로 간다.
 */
export const SVG_ID_TO_SIDO: Record<string, string> = {
  'seoul':               '서울특별시',
  'busan':               '부산광역시',
  'daegu':               '대구광역시',
  'incheon':             '인천광역시',
  'gwangju':             '전남광주통합특별시', // 2026.07 통합
  'daejeon':             '대전광역시',
  'ulsan':               '울산광역시',
  'sejong':              '세종특별자치시',
  'gyeonggi':            '경기도',
  'gangwon':             '강원특별자치도',
  'north-chungcheong':   '충청북도',
  'south-chungcheong':   '충청남도',
  'north-jeolla':        '전북특별자치도',
  'south-jeolla':        '전남광주통합특별시', // 2026.07 통합
  'north-gyeongsang':    '경상북도',
  'south-gyeongsang':    '경상남도',
  'jeju':                '제주특별자치도',
}
