import { SITE } from '@config';

export type SitemapEntry = {
    loc: string;
    lastmod?: Date | string | null;
    changefreq?:
        | 'always'
        | 'hourly'
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'yearly'
        | 'never';
    priority?: number;
};

const escapeXml = (s: string) =>
    s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const toIsoDate = (d: Date | string | null | undefined) => {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

export const absUrl = (path: string) => {
    const base = SITE.website.replace(/\/$/, '');
    if (!path.startsWith('/')) path = '/' + path;
    return base + path;
};

export const buildUrlset = (entries: SitemapEntry[]): string => {
    const items = entries
        .map(e => {
            const last = toIsoDate(e.lastmod);
            const parts = [
                `    <loc>${escapeXml(e.loc)}</loc>`,
                last ? `    <lastmod>${last}</lastmod>` : null,
                e.changefreq
                    ? `    <changefreq>${e.changefreq}</changefreq>`
                    : null,
                e.priority !== undefined
                    ? `    <priority>${e.priority.toFixed(1)}</priority>`
                    : null,
            ].filter(Boolean);
            return `  <url>\n${parts.join('\n')}\n  </url>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
};

export const buildSitemapIndex = (
    entries: { loc: string; lastmod?: Date | string | null }[]
): string => {
    const items = entries
        .map(e => {
            const last = toIsoDate(e.lastmod);
            const parts = [
                `    <loc>${escapeXml(e.loc)}</loc>`,
                last ? `    <lastmod>${last}</lastmod>` : null,
            ].filter(Boolean);
            return `  <sitemap>\n${parts.join('\n')}\n  </sitemap>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
};

export const xmlResponse = (xml: string) =>
    new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
