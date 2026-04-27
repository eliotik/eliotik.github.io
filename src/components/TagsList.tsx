import { useMemo, useState } from 'react';

export type TagItem = {
    tag: string;
    tagName: string;
    count: number;
};

export interface Props {
    tags: TagItem[];
}

type SortMode = 'count' | 'alpha';

export default function TagsList({ tags }: Props) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<SortMode>('count');

    const max = useMemo(
        () => tags.reduce((acc, t) => Math.max(acc, t.count), 0) || 1,
        [tags]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const matches = tags.filter(
            t =>
                !q ||
                t.tag.toLowerCase().includes(q) ||
                t.tagName.toLowerCase().includes(q)
        );
        const sorted = [...matches];
        if (sort === 'count') {
            sorted.sort(
                (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
            );
        } else {
            sorted.sort((a, b) => a.tag.localeCompare(b.tag));
        }
        return sorted;
    }, [tags, query, sort]);

    const trimmed = query.trim();

    return (
        <div>
            <div className="my-4 border-t border-dashed border-skin-line/60 pt-3 text-xs italic text-skin-base/60">
                {filtered.length} of {tags.length} tags
                {trimmed ? <> matching &ldquo;{trimmed}&rdquo;</> : null}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <span
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-skin-base/50"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="6.5" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                    </span>
                    <input
                        type="search"
                        className="w-full rounded-sm border border-skin-line bg-skin-card/30 py-2 pl-9 pr-8 font-mono text-sm text-skin-base outline-none transition-colors placeholder:text-skin-base/40 focus:border-skin-accent focus:bg-skin-card/60"
                        placeholder="Filter tags…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        aria-label="Filter tags"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear filter"
                            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-base text-skin-base/60 transition-colors hover:bg-skin-card hover:text-skin-base"
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="flex items-baseline justify-end gap-1.5 font-mono text-xs text-skin-base/60">
                    <span>by</span>
                    <button
                        type="button"
                        onClick={() => setSort('count')}
                        aria-pressed={sort === 'count'}
                        className={`px-1 transition-colors ${
                            sort === 'count'
                                ? 'text-skin-accent'
                                : 'text-skin-base/60 hover:text-skin-base'
                        }`}
                    >
                        count
                    </button>
                    <span className="text-skin-base/40">/</span>
                    <button
                        type="button"
                        onClick={() => setSort('alpha')}
                        aria-pressed={sort === 'alpha'}
                        className={`px-1 transition-colors ${
                            sort === 'alpha'
                                ? 'text-skin-accent'
                                : 'text-skin-base/60 hover:text-skin-base'
                        }`}
                    >
                        a→z
                    </button>
                </div>
            </div>

            <ul className="flex flex-col">
                {filtered.map(t => (
                    <li key={t.tag}>
                        <a
                            href={`/tags/${t.tag}/`}
                            className="group grid grid-cols-[minmax(0,1fr)_56px_28px] items-center gap-3 border-t border-skin-line/40 px-1 py-2 transition-colors last:border-b last:border-skin-line/40 hover:bg-skin-card/30 sm:grid-cols-[minmax(0,1fr)_80px_32px] sm:gap-4"
                        >
                            <span className="truncate font-mono text-sm font-semibold text-skin-accent transition-colors">
                                <span className="mr-1.5 text-skin-base/40">
                                    #
                                </span>
                                {t.tag}
                            </span>
                            <span className="block h-1.5 overflow-hidden rounded-sm bg-skin-line">
                                <span
                                    className="block h-full bg-skin-base/40 transition-colors group-hover:bg-skin-accent"
                                    style={{
                                        width: `${Math.max(4, (t.count / max) * 100)}%`,
                                    }}
                                />
                            </span>
                            <span className="text-right font-mono text-xs font-semibold tabular-nums text-skin-base/80">
                                {t.count}
                            </span>
                        </a>
                    </li>
                ))}
                {filtered.length === 0 && (
                    <li className="px-1 py-6 text-sm italic text-skin-base/60">
                        No tags match.
                    </li>
                )}
            </ul>
        </div>
    );
}
