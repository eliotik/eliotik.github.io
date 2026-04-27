import type { CollectionEntry } from 'astro:content';
import { slugifyStr } from '@utils/slugify';
import collectionFilter from '@utils/collectionFilter';

export type RelatedTag = {
    tag: string;
    tagName: string;
    count: number;
};

/**
 * For the given tag slug, returns other tags that co-occur on the same posts,
 * sorted by frequency (descending), then alphabetically. The current tag is
 * excluded. Drafts and scheduled posts are filtered out by collectionFilter.
 */
const getRelatedTags = (
    posts: CollectionEntry<'blog'>[] = [],
    currentTag: string,
    limit = 8
): RelatedTag[] => {
    const filteredPosts = posts.filter(
        collectionFilter<CollectionEntry<'blog'>>
    );

    const postsWithTag = filteredPosts.filter(post =>
        post.data.tags.some(t => slugifyStr(t) === currentTag)
    );

    const counts = new Map<string, { name: string; count: number }>();
    postsWithTag.forEach(post => {
        post.data.tags.forEach(tag => {
            const slug = slugifyStr(tag);
            if (slug === currentTag) return;
            const existing = counts.get(slug);
            counts.set(slug, {
                name: tag,
                count: (existing?.count ?? 0) + 1,
            });
        });
    });

    return Array.from(counts.entries())
        .map(([slug, { name, count }]) => ({
            tag: slug,
            tagName: name,
            count,
        }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
        .slice(0, limit);
};

export default getRelatedTags;
