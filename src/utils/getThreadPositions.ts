import type { CollectionEntry } from 'astro:content';
import getSortedCollection from '@utils/getSortedCollection.ts';

export type ThreadPosition = {
    thread: string;
    position: number;
    total: number;
};

export type ThreadPositions = Record<string, ThreadPosition>;

/**
 * Given a flat list of blog posts, returns a map keyed by post slug whose
 * values describe each post's position within its thread (if any).
 * Posts with no `thread` are omitted. Ordering matches the ascending order
 * used by getSortedThreads so "N of M" reflects the reading sequence.
 */
const getThreadPositions = (
    posts: CollectionEntry<'blog'>[] = []
): ThreadPositions => {
    const threads: Record<string, CollectionEntry<'blog'>[]> = {};

    posts.forEach(post => {
        const thread = post.data.thread;
        if (!thread?.length) return;
        if (!threads[thread]) threads[thread] = [];
        threads[thread]!.push(post);
    });

    const positions: ThreadPositions = {};

    Object.entries(threads).forEach(([thread, threadPosts]) => {
        const ordered = getSortedCollection<CollectionEntry<'blog'>>(
            threadPosts,
            'asc'
        );
        ordered.forEach((post, index) => {
            positions[post.id] = {
                thread,
                position: index + 1,
                total: ordered.length,
            };
        });
    });

    return positions;
};

export default getThreadPositions;
