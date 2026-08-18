import type { MetadataRoute } from 'next'
import { getAllRegions } from '@/lib/data'
import { getReportMonths, ymToSlug } from '@/lib/monthly-report'
import { SITE_URL as siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const regions = getAllRegions()
  const now = new Date()

  // /map·/compare 는 고유 텍스트가 거의 없는 도구 화면이라 sitemap에서 제외하고
  // 페이지 자체도 noindex 로 둔다. 색인 표본이 얇은 페이지로 채워지면
  // 사이트 전체가 "가치가 별로 없는 콘텐츠"로 평가된다.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/ranking`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/trending`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/report`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/methodology`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const regionRoutes: MetadataRoute.Sitemap = regions.flatMap(r => {
    const base = `${siteUrl}/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`
    return [
      { url: base, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${base}/detail`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    ]
  })

  // 월간 리포트 — 데이터가 한 달 늘면 한 장씩 늘어난다 (backlog.md N-5)
  const reportRoutes: MetadataRoute.Sitemap = getReportMonths().map(ym => ({
    url: `${siteUrl}/report/${ymToSlug(ym)}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...reportRoutes, ...regionRoutes]
}
