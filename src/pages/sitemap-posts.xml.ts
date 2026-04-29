import type { APIRoute } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import getSortedCollection from '@utils/getSortedCollection';
import {
    absUrl,
    buildUrlset,
    xmlResponse,
    type SitemapEntry,
} from '@utils/sitemapXml';

export const GET: APIRoute = async () => {
    const posts = await getCollection('blog');
    const sorted = getSortedCollection<CollectionEntry<'blog'>>(posts);

    const entries: SitemapEntry[] = sorted.map(post => ({
        loc: absUrl(`/posts/${post.id}/`),
        lastmod: post.data.modDatetime ?? post.data.pubDatetime,
        changefreq: 'monthly',
        priority: 0.8,
    }));

    return xmlResponse(buildUrlset(entries));
};
