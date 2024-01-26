import { SITE } from "@config";
import type { CollectionEntry } from 'astro:content';

const collectionFilter = <Collection extends CollectionEntry<'blog' | 'tips'>>({ data }: Collection) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default collectionFilter;
