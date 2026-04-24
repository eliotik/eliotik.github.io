import type { CollectionEntry } from 'astro:content';

export interface Props {
    href: string;
    frontmatter: CollectionEntry<'blog'>['data'];
    id: number;
}

export default function ThreadCard({ href, frontmatter, id }: Props) {
    const { title, description } = frontmatter;
    const num = String(id).padStart(2, '0');

    return (
        <li>
            <a
                href={href}
                className="group grid grid-cols-[40px_1fr_auto] items-start gap-3 py-3.5 pr-1 transition-colors hover:bg-skin-card/40 sm:grid-cols-[56px_1fr_auto] sm:gap-4"
            >
                <div className="flex items-start justify-end self-stretch border-r border-skin-line/40 pr-2.5 pt-0.5 transition-colors group-hover:border-skin-accent/70 sm:pr-3">
                    <span className="text-xs font-medium tabular-nums tracking-wider text-skin-base/50 transition-colors group-hover:text-skin-accent">
                        {num}
                    </span>
                </div>
                <div className="min-w-0">
                    <h3 className="mb-1 text-sm font-bold text-skin-accent">
                        {title}
                    </h3>
                    <p className="text-xs leading-relaxed text-skin-base/70">
                        {description}
                    </p>
                </div>
                <span
                    aria-hidden
                    className="pr-1 pt-0.5 text-skin-base/40 transition-all group-hover:translate-x-0.5 group-hover:text-skin-accent"
                >
                    →
                </span>
            </a>
        </li>
    );
}
