import rss from "@astrojs/rss";
import { type CollectionEntry, getCollection } from "astro:content";
import getSortedCollection from "@utils/getSortedCollection.ts";
import { SITE } from "@config";

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedCollection<CollectionEntry<'blog'>>(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, slug }) => ({
      link: `posts/${slug}`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
