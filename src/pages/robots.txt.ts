import type { APIRoute } from 'astro';
import { SITE } from '@config';

const robots = `
User-agent: Googlebot
Disallow: /nogooglebot/
Disallow: /~partytown/

User-agent: *
Allow: /
Disallow: /~partytown/

Sitemap: ${new URL('sitemap-index.xml', SITE.website).href}
`.trim();

export const GET: APIRoute = () =>
    new Response(robots, {
        headers: { 'Content-Type': 'text/plain' },
    });
