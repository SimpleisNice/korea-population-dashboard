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
  description: '부동산 구매 전 꼭 확인하는 시군구 인구 통계. 인구 추이, 세대수, 연령 구조, 전입출 현황을 한눈에 확인하세요.',
  keywords: ['인구통계', '시군구 인구', '부동산', '인구 추이', '세대수'],
}

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
