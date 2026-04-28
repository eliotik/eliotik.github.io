import type { CollectionEntry } from 'astro:content';
import { slugifyStr } from '@utils/slugify';
import getSortedCollection from '@utils/getSortedCollection';
import collectionFilter from '@utils/collectionFilter';

export type ThreadArticle = {
    slug: string;
    title: string;
    description: string;
    position: number;
    readTime: number;
};

export type ThreadTopTag = {
    tag: string;
    tagName: string;
    count: number;
};

export type ThreadDetail = {
    slug: string;
    title: string;
    articles: ThreadArticle[];
    articleCount: number;
    totalReadTime: number;
    topTags: ThreadTopTag[];
};

const WORDS_PER_MINUTE = 200;

const estimateReadTime = (body: string | undefined): number => {
    if (!body) return 1;
    const words = body
        .replace(/```[\s\S]*?```/g, ' ') // strip fenced code blocks
        .replace(/`[^`]*`/g, ' ') // strip inline code
        .replace(/[#>*_~`\-\[\]\(\)!]/g, ' ') // common markdown punctuation
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

/**
 * Returns the full detail bundle for a single thread:
 * the ordered article list (reading order), totals, and the top-4
 * most frequent tags across the thread.
 */
const getThreadDetail = (
    posts: CollectionEntry<'blog'>[] = [],
    threadName: string
): ThreadDetail | null => {
    const filtered = posts.filter(collectionFilter<CollectionEntry<'blog'>>);
    const inThread = filtered.filter(p => p.data.thread === threadName);
    if (inThread.length === 0) return null;

    const sorted = getSortedCollection<CollectionEntry<'blog'>>(
        inThread,
        'asc'
    );

    const articles: ThreadArticle[] = sorted.map((post, idx) => ({
        slug: post.slug,
        title: post.data.title,
        description: post.data.description,
        position: idx + 1,
        readTime: estimateReadTime(post.body),
    }));

    const totalReadTime = articles.reduce((acc, a) => acc + a.readTime, 0);

    const tagCounts = new Map<string, { name: string; count: number }>();
    sorted.forEach(post => {
        post.data.tags.forEach(t => {
            const slug = slugifyStr(t);
            const entry = tagCounts.get(slug);
            tagCounts.set(slug, {
                name: t,
                count: (entry?.count ?? 0) + 1,
            });
        });
    });

    const topTags = Array.from(tagCounts.entries())
        .map(([slug, { name, count }]) => ({
            tag: slug,
            tagName: name,
            count,
        }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
        .slice(0, 4);

    return {
        slug: slugifyStr(threadName),
        title: threadName,
        articles,
        articleCount: articles.length,
        totalReadTime,
        topTags,
    };
};

export default getThreadDetail;
