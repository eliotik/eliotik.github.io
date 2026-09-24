import type { APIRoute } from 'astro';
import {
    absUrl,
    buildUrlset,
    xmlResponse,
    type SitemapEntry,
} from '@utils/sitemapXml';

// Static / non-content pages plus the /posts/ and /tips/ indexes.
// /tags/ and /threads/ are listed in their own section sitemaps.
// Pagination tail pages (/posts/2/, /tips/2/, /tags/<x>/2/) are intentionally
// excluded from the sitemap and emit <meta name="robots" content="noindex,follow">.
export const GET: APIRoute = async () => {
    const entries: SitemapEntry[] = [
        { loc: absUrl('/'), changefreq: 'weekly', priority: 1.0 },
        { loc: absUrl('/about/'), changefreq: 'yearly', priority: 0.7 },
        { loc: absUrl('/posts/'), changefreq: 'weekly', priority: 0.9 },
        { loc: absUrl('/tips/'), changefreq: 'weekly', priority: 0.7 },
        { loc: absUrl('/search/'), changefreq: 'yearly', priority: 0.3 },
    ];

    return xmlResponse(buildUrlset(entries));
};
