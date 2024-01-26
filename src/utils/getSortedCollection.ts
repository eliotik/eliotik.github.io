import collectionFilter from "./collectionFilter.ts";
import type { CollectionEntry } from 'astro:content';

const getSortedCollection = <Collection extends CollectionEntry<'blog' | 'tips'>>(collection: Collection[] = []) => {
  return collection
    .filter(collectionFilter<Collection>)
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
};

export default getSortedCollection;
