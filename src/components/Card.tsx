import { slugifyStr } from '@utils/slugify';
import type { CollectionEntry } from 'astro:content';
import type { ThreadPosition } from '@utils/getThreadPositions';

export interface Props {
    href?: string;
    frontmatter: CollectionEntry<'blog'>['data'];
    secHeading?: boolean;
    showDescription?: boolean;
    threadPosition?: ThreadPosition;
}

export default function Card({
    href,
    frontmatter,
    secHeading = true,
    showDescription = true,
    threadPosition,
}: Props) {
    const { title, description } = frontmatter;

    const headerProps = {
        style: { viewTransitionName: slugifyStr(title) },
        className: 'text-lg font-medium decoration-dashed hover:underline',
    };

    return (
        <li className="my-6">
            <a
                href={href}
                className="text-skin-accent inline-block text-lg font-medium decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
            >
                {secHeading ? (
                    <h2 {...headerProps}>{title}</h2>
                ) : (
                    <h3 {...headerProps}>{title}</h3>
                )}
            </a>
            {threadPosition && (
                <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs tabular-nums">
                    <span className="text-skin-base/50 font-semibold tracking-wider uppercase">
                        Part of
                    </span>
                    <span className="text-skin-accent font-medium">
                        {threadPosition.thread}
                    </span>
                    <span className="text-skin-base/40">·</span>
                    <span className="text-skin-base/60">
                        {threadPosition.position} of {threadPosition.total}
                    </span>
                </div>
            )}
            {showDescription ? (
                <p className={threadPosition ? 'mt-3' : 'mt-8'}>
                    {description}
                </p>
            ) : null}
        </li>
    );
}
