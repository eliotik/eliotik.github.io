import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://www.novifyx.com", // replace this with your deployed domain
  author: "Alexander Pustomelnyk",
  desc: "New Partial Derivative!",
  title: "Novi Fyx",
  ogImage: "novifyx-og.jpg",
  lightAndDarkMode: true,
  entitiesPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/eliotik",
    linkTitle: `Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/alexander-pustomelnyk",
    linkTitle: `LinkedIn`,
    active: true,
  },
  {
    name: "Rss",
    href: "/rss.xml",
    linkTitle: `RSS`,
    active: true,
  },
];