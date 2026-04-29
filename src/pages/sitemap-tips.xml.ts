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
    const tips = await getCollection('tips');
    const sorted = getSortedCollection<CollectionEntry<'tips'>>(tips);

    const entries: SitemapEntry[] = sorted.map(tip => ({
        loc: absUrl(`/tips/${tip.data.customSlug}/`),
        lastmod: tip.data.modDatetime ?? tip.data.pubDatetime,
        changefreq: 'monthly',
        priority: 0.6,
    }));

    return xmlResponse(buildUrlset(entries));
};
