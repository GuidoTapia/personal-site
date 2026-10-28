import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One markdown file per role. The body is the bullet list shown under the role.
const jobs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/jobs' }),
  schema: z.object({
    date: z.coerce.date(), // start date; roles are listed newest first
    title: z.string(),
    company: z.string(),
    location: z.string(),
    range: z.string(),
    url: z.url(),
    tech: z.array(z.string()).default([]),
  }),
});

// One folder per piece of work (`<slug>/index.md` plus optional images). Each entry gets a card on
// the homepage and its own page at /work/<slug>. Entries can later come from other repos by
// swapping or adding a loader here; pages only depend on this schema.
const work = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/work',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(), // one or two sentences for the card and meta description
      kind: z.enum(['case-study', 'achievement']),
      role: z.string(),
      period: z.string(),
      order: z.number(), // lower comes first
      tech: z.array(z.string()).default([]),
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { jobs, work };
