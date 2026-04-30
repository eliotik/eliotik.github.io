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
            <header className="border-skin-line/40 flex items-baseline justify-between gap-4 border-b pb-2">
                <h2 {...headerProps}>
                    <a
                        href={`/threads/${slug}/`}
                        className="hover:text-skin-accent decoration-dashed underline-offset-4 hover:underline focus-visible:outline-dashed"
                    >
                        {thread}
                    </a>
                </h2>
                <span className="text-skin-base/60 shrink-0 text-xs whitespace-nowrap tabular-nums">
                    <strong className="text-skin-base/80 text-sm font-semibold">
                        {posts.length}
                    </strong>{' '}
                    articles
                </span>
            </header>
            <ul className="divide-skin-line/40 border-skin-line/60 flex flex-col divide-y border-b">
                {posts.map((post: CollectionEntry<'blog'>, index) => (
                    <ThreadCard
                        href={`/posts/${post.id}`}
                        frontmatter={post.data}
                        key={post.id}
                        id={index + 1}
                    />
                ))}
            </ul>
        </section>
    );
}
