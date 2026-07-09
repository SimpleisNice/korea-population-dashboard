import type { MetadataRoute } from 'next'
import { getAllRegions } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const regions = getAllRegions()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/ranking`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/trending`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/compare`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/methodology`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const regionRoutes: MetadataRoute.Sitemap = regions.flatMap(r => {
    const base = `${siteUrl}/${encodeURIComponent(r.sido)}/${encodeURIComponent(r.sigungu)}`
    return [
      { url: base, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${base}/detail`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    ]
  })

  return [...staticRoutes, ...regionRoutes]
}
