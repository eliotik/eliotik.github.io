import type socialIcons from "@assets/socialIcons";
import type { CollectionEntry } from 'astro:content';

export type Site = {
  website: string;
  author: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  entitiesPerPage: number;
  scheduledPostMargin: number;
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

export type SortedThread = {
  thread: string;
  slug: string;
  posts: CollectionEntry<"blog">[];
};