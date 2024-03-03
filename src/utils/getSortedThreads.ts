import type { CollectionEntry } from 'astro:content';
import getSortedCollection from '@utils/getSortedCollection.ts';
import type { SortedThread } from '../types.ts';
import { slugifyStr } from '@utils/slugify.ts';

const getSortedThreads = (posts: CollectionEntry<'blog'>[] = []) => {
    const threads: Record<string, CollectionEntry<'blog'>[]> = {};

    posts.forEach(post => {
        const thread = post.data.thread;
        if (!thread?.length) {
            return;
        }
        if (!threads[thread]) {
            threads[thread] = [];
        }

        threads[thread]!.push(post);
    });
    const sortedThreads: SortedThread[] = [];

    Object.entries(threads).forEach(([thread, posts]) => {
        if (!posts.length) {
            return;
        }

        sortedThreads.push({
            thread,
            slug: slugifyStr(thread),
            posts: getSortedCollection<CollectionEntry<'blog'>>(posts, 'asc'),
        });
    });

    return sortedThreads;
};

export default getSortedThreads;
