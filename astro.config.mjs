import { defineConfig, passthroughImageService } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { SITE } from "./src/config";


// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    react(),
    sitemap(),
  ],
  // image: {
  //  // https://docs.astro.build/en/reference/errors/missing-sharp/
  //  service: passthroughImageService(),
  // },
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
