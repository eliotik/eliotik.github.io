import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
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
  trailingSlash: 'ignore',
  // T-38 D1: dev-toolbar dynamic imports race with Vite optimizer
  // on cold start in 6.2.x. Disabling eliminates 504s entirely.
  // Production unaffected (toolbar is dev-only).
  devToolbar: { enabled: false },
  redirects: {
    '/posts/1/': '/posts',
    '/tips/1/': '/tips',
  },
  integrations: [
  partytown({ config: { forward: ['dataLayer.push'] } }),
  expressiveCode({
      plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
    }),
  mdx(),
  react({
    experimentalReactChildren: true
  }),
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
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
      // Force include commonly used deps to prevent re-optimization
      include: ["fuse.js", "react", "react-dom"]
    },
    server: {
      watch: {
        // Ignore node_modules to avoid unnecessary reloads
        ignored: ['**/node_modules/**', '**/.git/**']
      },
      // Prevent premature optimization
      preTransformRequests: true
    },
    // Clear screen on dev server start
    clearScreen: false
  },
  scopedStyleStrategy: "where"
});
