import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const writingSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  updated: z.date().optional(),
  status: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false)
})

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  updated: z.date().optional(),
  status: z.string(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  repo: z.string().optional(),
  website: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false)
})

const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
  updated: z.date().optional(),
  thumbnail: z.string().optional(),
  draft: z.boolean().default(false)
})

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: '*/blog/**/*.md',
      schema: writingSchema
    }),
    lab: defineCollection({
      type: 'page',
      source: '*/lab/*.md',
      schema: writingSchema
    }),
    projects: defineCollection({
      type: 'page',
      source: '*/projects/*.md',
      schema: projectSchema
    }),
    pages: defineCollection({
      type: 'page',
      source: '*/about.md',
      schema: pageSchema
    })
  }
})
