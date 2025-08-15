import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { SITE } from "./src/config";

import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import partytown from '@astrojs/partytown';

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
  partytown({ config: { forward: ['dataLayer.push'] } }),
  tailwind({
    applyBaseStyles: false
  }),
  expressiveCode({
      plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
    }),
  mdx(),
  react({
    experimentalReactChildren: true
  }),
    sitemap(),
  ],
  // image: {
  //  // https://docs.astro.build/en/reference/errors/missing-sharp/
  //  service: passthroughImageService(),
  // },
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, {
      test: "Table of contents"
    }]],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"]
    }
  },
  scopedStyleStrategy: "where"
});