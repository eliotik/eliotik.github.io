import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import getUniqueTags from '@utils/getUniqueTags';
import {
    absUrl,
    buildUrlset,
    xmlResponse,
    type SitemapEntry,
} from '@utils/sitemapXml';

export const GET: APIRoute = async () => {
    const posts = await getCollection('blog');
    const tags = getUniqueTags(posts);

    const entries: SitemapEntry[] = [
        {
            loc: absUrl('/tags/'),
            changefreq: 'weekly',
            priority: 0.5,
        },
        // Only include the canonical (page-1) URL for each tag.
        // /tags/<tag>/2/, /3/, ... are paginated archives now flagged noindex.
        ...tags.map(t => ({
            loc: absUrl(`/tags/${t.tag}/`),
            changefreq: 'monthly' as const,
            priority: 0.4,
        })),
    ];

    return xmlResponse(buildUrlset(entries));
};
