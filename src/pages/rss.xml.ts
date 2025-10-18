import rss from '@astrojs/rss';
import { type CollectionEntry, getCollection } from 'astro:content';
import getSortedCollection from '@utils/getSortedCollection.ts';
import { SITE } from '@config';

export async function GET() {
    const posts = await getCollection('blog');
    const tips = await getCollection('tips');

    const sortedPosts = getSortedCollection<CollectionEntry<'blog'>>(posts);
    const sortedTips = getSortedCollection<CollectionEntry<'tips'>>(tips);

    const postItems = sortedPosts.map(({ data, slug }) => ({
        link: `posts/${slug}`,
        title: data.title,
        description: data.description,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    }));

    const tipItems = sortedTips.map(({ data }) => ({
        link: `tips/${data.customSlug}`,
        title: data.title,
        description: data.title,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    }));

    // Combine and sort all items by date
    const allItems = [...postItems, ...tipItems].sort(
        (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()
    );

    return rss({
        title: SITE.title,
        description: SITE.desc,
        site: SITE.website,
        items: allItems,
    });
}
