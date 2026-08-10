/**
 * 사이트 절대 URL — canonical·OG·sitemap·robots 가 공유하는 단일 출처.
 *
 * 이전에는 sitemap.ts / robots.ts / 지역 페이지가 각자 상수를 두었고 기본값도 서로 달라
 * (example.com vs 실제 도메인) 환경변수 누락 시 SEO가 조용히 깨졌다.
 * 또한 NEXT_PUBLIC_SITE_URL 에 후행 슬래시가 있으면 `https://host//path` 처럼
 * 이중 슬래시 URL이 생성돼 canonical 신호가 분산된다. 여기서 한 번만 정규화한다.
 */
const DEFAULT_SITE_URL = 'https://korea-population-dashboard.vercel.app'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')

/** 사이트 루트 기준 경로를 절대 URL로 만든다. path 는 '/' 로 시작해야 한다. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
