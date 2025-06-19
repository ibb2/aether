// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
        : 'http://localhost:3000' // Or your local testing URL

    return [
        {
            url: site + '/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
    ]
}
