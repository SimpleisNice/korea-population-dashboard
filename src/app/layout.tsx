import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "대한민국 인구 인사이트 대시보드",
  description: "행정안전부 주민등록 데이터 기반 대한민국 시도별 인구 변동 시각화 대시보드. 인구 추이, 성별 구성, 지역별 변동률을 한눈에 확인하세요.",
  keywords: ["대한민국 인구", "주민등록 통계", "인구 대시보드", "시도별 인구", "인구 변화", "Korea Population", "Demographics Dashboard"],
  openGraph: {
    title: "대한민국 인구 인사이트 대시보드",
    description: "행정안전부 주민등록 데이터로 보는 대한민국 인구 변화",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased dark`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-background text-on-background min-h-full font-body-base text-body-base glow-bg flex overflow-hidden">
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
