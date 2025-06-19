import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/app/',
                '/sign-in',
                '/sign-up',
                '/checkout/',
                '/settings/',
                '/features',
                '/pricing',
            ],
        },
        sitemap: process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? 'https://' +
              process.env.VERCEL_PROJECT_PRODUCTION_URL +
              '/sitemap.xml'
            : 'http://localhost:3000/sitemap.xml',
    }
}
