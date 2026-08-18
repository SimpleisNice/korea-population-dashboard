import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { BottomNav } from '@/components/layout/BottomNav'
import './globals.css'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | 인구통계',
    default: '부동산 인구통계 — 시군구 인구 현황',
  },
  description: '부동산 구매 전 꼭 확인하는 시군구 인구 통계. 인구 추이, 세대수, 연령 구조, 인구 증감을 한눈에 확인하세요.',
  keywords: ['인구통계', '시군구 인구', '부동산', '인구 추이', '세대수'],
  verification: {
    google: process.env.NEXT_GOOGLE_SITE_VERIFICATION,
  },
}

// adsbygoogle.js 는 여기(전역)에서 로드하지 않는다.
// 전역 로드 시 자동 광고(Auto Ads)가 지도·비교 빈 상태처럼 콘텐츠가 얇은 화면에도
// 광고를 자동 삽입해 "게시자 콘텐츠가 없는 화면" 정책 위반을 일으킨다.
// 스크립트는 AdSlot 이 실제로 광고를 렌더할 때만 함께 주입된다 — docs/principles.md E1.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.className}>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
