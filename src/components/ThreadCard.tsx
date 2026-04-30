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
                className="group hover:bg-skin-card/40 grid grid-cols-[40px_1fr_auto] items-start gap-3 py-3.5 pr-1 transition-colors sm:grid-cols-[56px_1fr_auto] sm:gap-4"
            >
                <div className="border-skin-line/40 group-hover:border-skin-accent/70 flex items-start justify-end self-stretch border-r pt-0.5 pr-2.5 transition-colors sm:pr-3">
                    <span className="text-skin-base/50 group-hover:text-skin-accent text-xs font-medium tracking-wider tabular-nums transition-colors">
                        {num}
                    </span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-skin-accent mb-1 text-sm font-bold">
                        {title}
                    </h3>
                    <p className="text-skin-base/70 text-xs leading-relaxed">
                        {description}
                    </p>
                </div>
                <span
                    aria-hidden
                    className="text-skin-base/40 group-hover:text-skin-accent pt-0.5 pr-1 transition-all group-hover:translate-x-0.5"
                >
                    →
                </span>
            </a>
        </li>
    );
}
