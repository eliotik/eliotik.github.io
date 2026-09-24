import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import remarkToc from 'remark-toc';
import remarkCollapse from 'remark-collapse';
import { unified } from '@astrojs/markdown-remark';
import { SITE } from './src/config';

import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import partytown from '@astrojs/partytown';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
    site: SITE.website,
    trailingSlash: 'ignore',
    redirects: {
        '/posts/1/': '/posts',
        '/tips/1/': '/tips',
    },
    integrations: [
        // Keep Partytown's sandbox iframe on <html>, outside <body>. In <body>,
        // @astrojs/partytown's astro:before-swap hook moves it into the
        // incoming document on every ClientRouter navigation, which destroys
        // the sandbox and its worker (aborting in-flight /~partytown/proxytown
        // XHRs) and restarts gtag. Outside <body> they live for the whole
        // visit and GA4 history events record soft navigations. Only safe
        // together with transition:persist on the gtag scripts in
        // src/layouts/Layout.astro; change both or neither.
        partytown({
            config: { forward: ['dataLayer.push'], sandboxParent: 'html' },
        }),
        expressiveCode({
            plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
        }),
        mdx(),
        react({
            experimentalReactChildren: true,
        }),
    ],
    // image: {
    //  // https://docs.astro.build/en/reference/errors/missing-sharp/
    //  service: passthroughImageService(),
    // },
    markdown: {
        // Astro 7 defaults to the Sätteri processor, which ignores remark plugins.
        // Stay on unified so remark-toc / remark-collapse keep rendering the TOC.
        processor: unified({
            remarkPlugins: [
                remarkToc,
                [
                    remarkCollapse,
                    {
                        test: 'Table of contents',
                    },
                ],
            ],
        }),
        shikiConfig: {
            theme: 'one-dark-pro',
            wrap: true,
        },
    },
    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            exclude: ['@resvg/resvg-js'],
            // Force include commonly used deps to prevent re-optimization
            include: ['fuse.js', 'react', 'react-dom'],
        },
        server: {
            watch: {
                // Ignore node_modules to avoid unnecessary reloads
                ignored: ['**/node_modules/**', '**/.git/**'],
            },
            // Prevent premature optimization
            preTransformRequests: true,
        },
        // Clear screen on dev server start
        clearScreen: false,
    },
    scopedStyleStrategy: 'where',
    // Astro 7 defaults to 'jsx' whitespace rules; keep lossless compression so
    // inline spacing matches the pre-upgrade output. Mirror in .prettierrc.
    compressHTML: true,
});
