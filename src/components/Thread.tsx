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
        className: 'text-lg font-medium decoration-dashed',
    };

    return (
        <div key={slug}>
            <h2 {...headerProps}>{thread}</h2>
            <ul className="my-4 flex touch-auto snap-x space-x-4 overflow-x-auto overflow-y-hidden">
                {posts.map((post: CollectionEntry<'blog'>, index) => (
                    <ThreadCard
                        href={`/posts/${post.slug}`}
                        frontmatter={post.data}
                        key={post.slug}
                        id={index + 1}
                    />
                ))}
            </ul>
        </div>
    );
}
