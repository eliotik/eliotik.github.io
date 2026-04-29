import type { APIRoute } from 'astro';
import { absUrl, buildSitemapIndex, xmlResponse } from '@utils/sitemapXml';

export const GET: APIRoute = async () => {
    const now = new Date();
    const xml = buildSitemapIndex([
        { loc: absUrl('/sitemap-pages.xml'), lastmod: now },
        { loc: absUrl('/sitemap-posts.xml'), lastmod: now },
        { loc: absUrl('/sitemap-tips.xml'), lastmod: now },
        { loc: absUrl('/sitemap-threads.xml'), lastmod: now },
        { loc: absUrl('/sitemap-tags.xml'), lastmod: now },
    ]);

    return xmlResponse(xml);
};
