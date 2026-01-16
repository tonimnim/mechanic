/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://egarage.ke',
    generateRobotsTxt: false, // We have a custom robots.txt
    generateIndexSitemap: false,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 7000,

    // Exclude private routes
    exclude: [
        '/admin',
        '/admin/*',
        '/dashboard',
        '/dashboard/*',
        '/chats',
        '/chats/*',
        '/api/*',
    ],

    // Transform function for custom priorities
    transform: async (config, path) => {
        // Higher priority for important pages
        let priority = 0.7;
        let changefreq = 'daily';

        if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
        } else if (path === '/find') {
            priority = 0.9;
            changefreq = 'daily';
        } else if (path === '/about') {
            priority = 0.8;
            changefreq = 'weekly';
        } else if (path === '/welcome' || path.startsWith('/register')) {
            priority = 0.8;
            changefreq = 'weekly';
        } else if (path === '/login') {
            priority = 0.6;
            changefreq = 'monthly';
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: new Date().toISOString(),
        };
    },

    // Additional paths to include
    additionalPaths: async (config) => [
        { loc: '/', changefreq: 'daily', priority: 1.0 },
        { loc: '/find', changefreq: 'daily', priority: 0.9 },
        { loc: '/about', changefreq: 'weekly', priority: 0.8 },
        { loc: '/welcome', changefreq: 'weekly', priority: 0.8 },
        { loc: '/register/mechanic', changefreq: 'weekly', priority: 0.8 },
        { loc: '/register/client', changefreq: 'weekly', priority: 0.7 },
        { loc: '/login', changefreq: 'monthly', priority: 0.6 },
    ],
};
