import type { CollectionEntry } from 'astro:content';

export interface Props {
    href: string;
    frontmatter: CollectionEntry<'blog'>['data'];
    id: number;
}

export default function ThreadCard({ href, frontmatter, id }: Props) {
    const { title, description } = frontmatter;

    return (
        <li className="rounded p-4 sm:min-w-[17rem]">
            <div className="relative">
                <p className="absolute bottom-0 right-0 z-10 text-5xl text-gray-300">
                    {id}
                </p>
                <div className="relative z-20">
                    <div className="mb-2">
                        <a href={href} className="link inline-block">
                            <h3 className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0">
                                {title}
                            </h3>
                        </a>
                    </div>
                    <p className="w-60 overflow-hidden text-sm dark:text-gray-800">
                        {description}
                    </p>
                </div>
            </div>
        </li>
    );
}
