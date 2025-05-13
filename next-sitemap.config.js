/** @type {import('next-sitemap').IConfig} */

module.exports = {
    siteUrl: 'https://www.aethernotes.ink',
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    generateRobotsTxt: true,
    exclude: ['/server-sitemap.xml'], // <= exclude here
    // alternateRefs: [
    //     {
    //         href: 'https://es.example.com',
    //         hreflang: 'es',
    //     },
    //     {
    //         href: 'https://fr.example.com',
    //         hreflang: 'fr',
    //     },
    // ],
    // Default transformation function
    transform: async (config, path) => {
        return {
            loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
            alternateRefs: config.alternateRefs ?? [],
        }
    },
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
        additionalSitemaps: [
            'https://example.com/server-sitemap.xml', // <==== Add here
        ],
    },
}
