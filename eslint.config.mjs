// @ts-check
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

// ESLint handles code quality; Prettier owns formatting.
// Keep `eslintConfigPrettier` last so it disables any rules that conflict with Prettier.
export default withNuxt().append(eslintConfigPrettier)
