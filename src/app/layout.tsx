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
  title: "Korean Population Insight Dashboard",
  description: "A premium dashboard visualizing demographic changes, migration, and regional population shifts in the Republic of Korea.",
  keywords: ["Korea", "Population", "Demographics", "Dashboard", "Statistics"],
  openGraph: {
    title: "Korean Population Insight Dashboard",
    description: "Visualize demographic changes in South Korea with real-time data.",
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
      lang="en"
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
