import { SITE } from '@config';
import { defineCollection, reference, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: ({ image }) =>
        z.object({
            author: z.string().default(SITE.author),
            pubDatetime: z.date(),
            modDatetime: z.date().optional().nullable(),
            title: z.string(),
            featured: z.boolean().optional(),
            draft: z.boolean().optional(),
            tags: z.array(z.string()).default(['others']),
            ogImage: image()
                .refine(img => img.width >= 1200 && img.height >= 630, {
                    message:
                        'OpenGraph image must be at least 1200 X 630 pixels!',
                })
                .or(z.string())
                .optional(),
            description: z.string(),
            thread: z.string().optional(),
            canonicalURL: z.string().optional(),
            relatedPosts: z.array(reference('blog')).optional(),
        }),
});

const tips = defineCollection({
    type: 'content',
    schema: () =>
        z.object({
            author: z.string().default(SITE.author),
            pubDatetime: z.date(),
            modDatetime: z.date().optional().nullable(),
            title: z.string(),
            draft: z.boolean().optional(),
        }),
});

export const collections = { blog, tips };
