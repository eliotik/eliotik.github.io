# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog/website built with Astro, deployed to GitHub Pages. The site features blog posts, tips, and an about page.

## Development Commands

- `yarn dev` - Start development server
- `yarn build` - Build for production (runs Astro check, builds, and optimizes with jampack)
- `yarn preview` - Preview production build
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn lint` - Run ESLint
- `yarn sync` - Sync Astro content collections

## Architecture

### Content Collections

The site uses Astro's content collections system defined in `src/content/config.ts`:

- **blog**: Full blog posts with frontmatter including author, dates, title, tags, featured status, draft status, OG images, descriptions, and optional related posts
- **tips**: Shorter tips/hints with simpler frontmatter (author, dates, title, draft status)

Content lives in `src/content/blog/` and `src/content/tips/` as MDX files.

### Configuration

- **Site config**: `src/config.ts` - Contains SITE object (website URL, author, title, description, OG image), LOCALE settings, LOGO_IMAGE settings, and SOCIALS array
- **Astro config**: `astro.config.mjs` - Integrations include Tailwind (custom base styles disabled), MDX, React, Sitemap, Partytown (for analytics), and Expressive Code (for syntax highlighting with line numbers and collapsible sections)

### Page Routing

Dynamic routes for content:
- `/posts/` - Blog post listings with pagination
- `/posts/[slug]` - Individual blog posts
- `/tips/` - Tips listings with pagination
- `/tips/[slug]` - Individual tips
- `/tags/` - Tag listings
- `/tags/[tag]` - Posts filtered by tag
- `/threads/` - Thread listings

### Utilities (`src/utils/`)

Key utility functions:
- `getSortedCollection.ts` - Filters and sorts posts (removes drafts, scheduled posts, excludes by slug)
- `collectionFilter.ts` - Filters collection entries (draft status, scheduled post logic)
- `getPostsByTag.ts` - Filters posts by tag
- `generateOgImages.tsx` - Generates OG images using Satori
- `getPagination.ts` - Handles pagination logic
- `getUniqueTags.ts` - Extracts unique tags from posts

## Important Notes

- Node version: 18.19.0 (specified in `.nvmrc` and `package.json`)
- Uses Husky + lint-staged for pre-commit hooks (auto-formats files with Prettier)
- Markdown uses remark-toc and remark-collapse plugins
- Images optimized with sharp (pinned to 0.32.6)
- Build output is optimized with jampack
