import collectionFilter from './collectionFilter.ts';
import type { CollectionEntry } from 'astro:content';

export type SortDirection = 'asc' | 'desc';

const getSortedCollection = <
    Collection extends CollectionEntry<'blog' | 'tips'>,
>(
    collection: Collection[] = [],
    sortDirection: SortDirection = 'desc'
) => {
    return collection
        .filter(collectionFilter<Collection>)
        .sort((a, b) =>
            sortDirection === 'asc'
                ? Math.floor(
                      new Date(
                          a.data.modDatetime ?? a.data.pubDatetime
                      ).getTime() / 1000
                  ) -
                  Math.floor(
                      new Date(
                          b.data.modDatetime ?? b.data.pubDatetime
                      ).getTime() / 1000
                  )
                : Math.floor(
                      new Date(
                          b.data.modDatetime ?? b.data.pubDatetime
                      ).getTime() / 1000
                  ) -
                  Math.floor(
                      new Date(
                          a.data.modDatetime ?? a.data.pubDatetime
                      ).getTime() / 1000
                  )
        );
};

export default getSortedCollection;
