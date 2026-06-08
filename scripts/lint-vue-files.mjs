// Validates Vue/Nuxt file references before runtime "Failed to resolve component" errors.
//
// Checks:
// - Nuxt auto-import registry points at existing component files
// - definePageMeta layout names map to app/layouts/*.vue
// - explicit .vue imports resolve on disk
// - PascalCase template tags and resolveComponent() names are registered
// - component filenames do not repeat parent folder names (use folder pathPrefix)
//
// Depends on .nuxt/components.d.ts from `nuxt prepare`.

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const appDir = resolve(root, 'app')
const nuxtDir = resolve(root, '.nuxt')
const componentsDts = resolve(nuxtDir, 'components.d.ts')

const COMPONENT_EXPORT_RE =
  /^export const (\w+): (?:typeof import|LazyComponent<typeof import)\("([^"]+)"\)\['([^']+)'\]/
const LAYOUT_RE = /layout:\s*['"]([\w-]+)['"]/g
const VUE_IMPORT_RE = /from\s+['"]((?:~\/|@\/|\.\.?\/)[^'"]+\.vue)['"]/g
const VUE_DYNAMIC_IMPORT_RE = /import\(\s*['"]((?:~\/|@\/|\.\.?\/)[^'"]+\.vue)['"]\s*\)/g
const RESOLVE_COMPONENT_RE = /resolveComponent\(\s*['"]([A-Z][A-Za-z0-9]*)['"]\s*\)/g
const TEMPLATE_TAG_RE = /<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g

const VUE_INTRINSICS = new Set([
  'Component',
  'KeepAlive',
  'Suspense',
  'Teleport',
  'Transition',
  'TransitionGroup'
])

const SCAN_DIRS = ['pages', 'layouts', 'components', 'composables', 'middleware', 'plugins']
const SCAN_FILES = [resolve(appDir, 'app.vue')]

function walkFiles(dir, files = []) {
  if (!existsSync(dir)) {
    return files
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue
      }

      walkFiles(fullPath, files)
      continue
    }

    const ext = extname(entry.name)

    if (ext === '.vue' || ext === '.ts') {
      files.push(fullPath)
    }
  }

  return files
}

function latestMtime(paths) {
  let latest = 0

  for (const filePath of paths) {
    latest = Math.max(latest, statSync(filePath).mtimeMs)
  }

  return latest
}

function ensureNuxtPrepared() {
  const scanRoots = SCAN_DIRS.map((segment) => resolve(appDir, segment))
  const sourceFiles = [
    ...SCAN_FILES.filter((filePath) => existsSync(filePath)),
    ...scanRoots.flatMap((dir) => walkFiles(dir))
  ]

  const sourceMtime = sourceFiles.length ? latestMtime(sourceFiles) : 0
  const registryMtime = existsSync(componentsDts) ? statSync(componentsDts).mtimeMs : 0

  if (existsSync(componentsDts) && registryMtime >= sourceMtime) {
    return
  }

  console.log('[lint:vue] refreshing Nuxt component registry (nuxt prepare)...')

  const result = spawnSync('pnpm', ['exec', 'nuxt', 'prepare'], {
    cwd: root,
    stdio: 'inherit'
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  if (!existsSync(componentsDts)) {
    console.error('[lint:vue] .nuxt/components.d.ts was not generated')
    process.exit(1)
  }
}

function readComponentRegistry() {
  const names = new Set()
  const files = new Map()
  const missingFiles = []

  for (const line of readFileSync(componentsDts, 'utf8').split('\n')) {
    const match = line.match(COMPONENT_EXPORT_RE)

    if (!match) {
      continue
    }

    const [, name, importPath] = match

    if (name === 'componentNames') {
      continue
    }

    names.add(name)
    files.set(name, importPath)

    if (!importPath.includes('/app/') || !importPath.endsWith('.vue')) {
      continue
    }

    const absolutePath = resolve(nuxtDir, importPath)

    if (!existsSync(absolutePath)) {
      missingFiles.push({
        kind: 'registry',
        name,
        file: relative(root, absolutePath)
      })
    }
  }

  return { names, files, missingFiles }
}

function readLayouts() {
  const layoutsDir = resolve(appDir, 'layouts')

  if (!existsSync(layoutsDir)) {
    return new Set()
  }

  return new Set(
    readdirSync(layoutsDir)
      .filter((name) => name.endsWith('.vue'))
      .map((name) => name.slice(0, -4))
  )
}

function resolveVueImport(specifier) {
  const normalized = specifier
    .replace(/^~\//, 'app/')
    .replace(/^@\//, 'app/')
    .replace(/^\.\//, '')

  if (specifier.startsWith('../') || specifier.startsWith('./')) {
    return resolve(root, normalized)
  }

  return resolve(root, normalized)
}

function extractTemplates(content) {
  const templates = []
  const re = /<template\b[^>]*>([\s\S]*?)<\/template>/g
  let match = re.exec(content)

  while (match) {
    templates.push(match[1])
    match = re.exec(content)
  }

  return templates
}

function toPascalCase(value) {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function validateComponentFilenames() {
  const componentsRoot = resolve(appDir, 'components')
  const issues = []

  function walk(dir, segments = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        walk(fullPath, [...segments, entry.name])
        continue
      }

      if (!entry.name.endsWith('.vue')) {
        continue
      }

      const base = entry.name.replace(/\.client\.vue$/, '').replace(/\.vue$/, '')
      const folderPrefix = segments.map((segment) => toPascalCase(segment)).join('')

      if (folderPrefix && base.startsWith(folderPrefix) && base.length > folderPrefix.length) {
        issues.push({
          kind: 'filename',
          name: base,
          file: relative(root, fullPath)
        })
      }
    }
  }

  if (existsSync(componentsRoot)) {
    walk(componentsRoot)
  }

  return issues
}

function collectSourceFiles() {
  const files = [...SCAN_FILES.filter((filePath) => existsSync(filePath))]

  for (const segment of SCAN_DIRS) {
    files.push(...walkFiles(resolve(appDir, segment)))
  }

  return files
}

function scanSourceFiles(componentNames, layouts) {
  const issues = []

  for (const filePath of collectSourceFiles()) {
    const content = readFileSync(filePath, 'utf8')
    const relFile = relative(root, filePath)

    for (const match of content.matchAll(LAYOUT_RE)) {
      const layoutName = match[1]

      if (!layouts.has(layoutName)) {
        issues.push({
          kind: 'layout',
          name: layoutName,
          file: relFile
        })
      }
    }

    for (const pattern of [VUE_IMPORT_RE, VUE_DYNAMIC_IMPORT_RE]) {
      for (const match of content.matchAll(pattern)) {
        const target = resolveVueImport(match[1])

        if (!existsSync(target)) {
          issues.push({
            kind: 'import',
            name: match[1],
            file: relFile
          })
        }
      }
    }

    for (const match of content.matchAll(RESOLVE_COMPONENT_RE)) {
      const componentName = match[1]

      if (!componentNames.has(componentName) && !VUE_INTRINSICS.has(componentName)) {
        issues.push({
          kind: 'resolveComponent',
          name: componentName,
          file: relFile
        })
      }
    }

    if (!filePath.endsWith('.vue')) {
      continue
    }

    for (const template of extractTemplates(content)) {
      for (const match of template.matchAll(TEMPLATE_TAG_RE)) {
        const componentName = match[1]

        if (componentNames.has(componentName) || VUE_INTRINSICS.has(componentName)) {
          continue
        }

        issues.push({
          kind: 'template',
          name: componentName,
          file: relFile
        })
      }
    }
  }

  return issues
}

function printIssues(issues) {
  const labels = {
    registry: 'missing component file in Nuxt registry',
    layout: 'missing layout file',
    import: 'missing explicit .vue import',
    resolveComponent: 'unknown resolveComponent() target',
    template: 'unknown template component',
    filename: 'component filename repeats parent folder prefix'
  }

  for (const issue of issues) {
    console.error(`[lint:vue] ${labels[issue.kind]}: ${issue.name} (${issue.file})`)
  }
}

function main() {
  ensureNuxtPrepared()

  const { names, missingFiles } = readComponentRegistry()
  const layouts = readLayouts()
  const sourceIssues = scanSourceFiles(names, layouts)
  const filenameIssues = validateComponentFilenames()

  const issues = [...missingFiles, ...sourceIssues, ...filenameIssues]

  if (!issues.length) {
    console.log(`[lint:vue] ok (${names.size} registered components, ${layouts.size} layouts)`)
    return
  }

  printIssues(issues)
  console.error(`[lint:vue] found ${issues.length} issue(s)`)
  process.exit(1)
}

main()
