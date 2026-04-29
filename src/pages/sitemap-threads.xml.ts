import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import getSortedThreads from '@utils/getSortedThreads';
import {
    absUrl,
    buildUrlset,
    xmlResponse,
    type SitemapEntry,
} from '@utils/sitemapXml';

export const GET: APIRoute = async () => {
    const posts = await getCollection('blog');
    const threads = getSortedThreads(posts);

    const entries: SitemapEntry[] = [
        {
            loc: absUrl('/threads/'),
            changefreq: 'weekly',
            priority: 0.6,
        },
        ...threads.map(t => {
            // lastmod = newest post's modified or published date in the thread
            const dates = t.posts
                .map(p => p.data.modDatetime ?? p.data.pubDatetime)
                .filter(Boolean) as (Date | string)[];
            const latest = dates.length
                ? dates.reduce((acc, d) =>
                      new Date(d).getTime() > new Date(acc).getTime() ? d : acc
                  )
                : null;
            return {
                loc: absUrl(`/threads/${t.slug}/`),
                lastmod: latest,
                changefreq: 'monthly' as const,
                priority: 0.5,
            };
        }),
    ];

    return xmlResponse(buildUrlset(entries));
};
