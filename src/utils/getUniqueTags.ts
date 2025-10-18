import { slugifyStr } from './slugify';
import type { CollectionEntry } from 'astro:content';
import collectionFilter from './collectionFilter.ts';

interface Tag {
    tag: string;
    tagName: string;
    count: number;
}

const getUniqueTags = (posts: CollectionEntry<'blog'>[] = []) => {
    const filteredPosts = posts.filter(
        collectionFilter<CollectionEntry<'blog'>>
    );

    const tagCounts = new Map<string, number>();
    filteredPosts.forEach(post => {
        post.data.tags.forEach(tag => {
            const slugifiedTag = slugifyStr(tag);
            tagCounts.set(slugifiedTag, (tagCounts.get(slugifiedTag) || 0) + 1);
        });
    });

    const tags: Tag[] = Array.from(tagCounts.entries())
        .map(([slugTag, count]) => {
            const originalTag =
                filteredPosts
                    .flatMap(post => post.data.tags)
                    .find(tag => slugifyStr(tag) === slugTag) || slugTag;
            return { tag: slugTag, tagName: originalTag, count };
        })
        .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));

    return tags;
};

export default getUniqueTags;
