// Generates a static SDL file for nuxt-graphql-client codegen.
//
// The runtime schema lives as a template literal in `server/schema.ts` and the
// `/graph` endpoint is not running during `nuxt prepare`/build, so codegen
// cannot introspect it over HTTP. This script extracts that SDL into
// `schema.graphql`, which the GraphQL client points at via `clients.default.schema`.
//
// Keep this dependency-free so it runs in any install/build environment.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const schemaSource = resolve(here, '../server/schema.ts')
const schemaOutput = resolve(here, '../schema.graphql')

const source = readFileSync(schemaSource, 'utf8')

const start = source.indexOf('`')
const end = source.lastIndexOf('`')

if (start === -1 || end === -1 || start === end) {
  throw new Error('Could not locate the GraphQL SDL template literal in server/schema.ts')
}

const sdl = `${source.slice(start + 1, end).trim()}\n`

writeFileSync(schemaOutput, sdl, 'utf8')

console.log(`[graphql] schema.graphql synced from server/schema.ts (${sdl.length} bytes)`)
