// @ts-check
import markdown from '@eslint/markdown'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

const codeFiles = ['**/*.{js,mjs,cjs,ts,mts,cts,vue,tsx,jsx}']

/** Keep Nuxt/TS/Vue rules off Markdown — @eslint/markdown uses its own language. */
function scopeConfigsToCodeFiles(configs) {
  return configs.map((config) => {
    if (config.language?.startsWith('markdown/')) {
      return config
    }

    if (config.files?.some((pattern) => String(pattern).includes('.md'))) {
      return config
    }

    if (!config.files) {
      return { ...config, files: codeFiles }
    }

    return config
  })
}

// ESLint handles code quality; Prettier owns formatting.
// Keep `eslintConfigPrettier` last so it disables any rules that conflict with Prettier.
export default withNuxt()
  .prepend({
    name: 'mohetios/ignores',
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/.nitro/**',
      '**/.cache/**',
      '**/.velite/**',
      '**/.wrangler/**',
      '**/.data/**',
      '**/dist/**',
      '**/node_modules/**'
    ]
  })
  .onResolved(scopeConfigsToCodeFiles)
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  })
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-unused-components': 'error',
      'vue/no-unused-vars': 'error'
    }
  })
  .append(
    ...markdown.configs.recommended.map((config) => ({
      ...config,
      files: ['content/**/*.md'],
      language: 'markdown/gfm'
    })),
    eslintConfigPrettier
  )
