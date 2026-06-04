import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/models/schema.ts',
  out: './migrations',
  dialect: 'sqlite'
})
