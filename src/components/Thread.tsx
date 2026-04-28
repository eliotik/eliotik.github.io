import { slugifyStr } from '@utils/slugify';
import type { CollectionEntry } from 'astro:content';
import ThreadCard from '@components/ThreadCard.tsx';

export interface Props {
    thread: string;
    slug: string;
    posts: CollectionEntry<'blog'>[];
}

export default function Thread({ thread, slug, posts }: Props) {
    const headerProps = {
        style: { viewTransitionName: slugifyStr(thread) },
        className: 'text-lg font-bold text-skin-base',
    };

    return (
        <section
            key={slug}
            className="py-6 [&:first-of-type]:pt-2 [&:not(:first-of-type)]:mt-10 [&:not(:first-of-type)]:pt-2"
        >
            <header className="flex items-baseline justify-between gap-4 border-b border-skin-line/40 pb-2">
                <h2 {...headerProps}>
                    <a
                        href={`/threads/${slug}/`}
                        className="decoration-dashed underline-offset-4 hover:text-skin-accent hover:underline focus-visible:outline-dashed"
                    >
                        {thread}
                    </a>
                </h2>
                <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-skin-base/60">
                    <strong className="text-sm font-semibold text-skin-base/80">
                        {posts.length}
                    </strong>{' '}
                    articles
                </span>
            </header>
            <ul className="flex flex-col divide-y divide-skin-line/40 border-b border-skin-line/60">
                {posts.map((post: CollectionEntry<'blog'>, index) => (
                    <ThreadCard
                        href={`/posts/${post.slug}`}
                        frontmatter={post.data}
                        key={post.slug}
                        id={index + 1}
                    />
                ))}
            </ul>
        </section>
    );
}
