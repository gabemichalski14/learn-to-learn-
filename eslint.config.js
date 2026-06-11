import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import noUnstableDeps from './eslint-rules/no-unstable-deps.js'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      local: { rules: { 'no-unstable-deps': noUnstableDeps } },
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Guardrail: an unstable value in a hook dependency array caused the
      // Home-page render loop. See eslint-rules/no-unstable-deps.js.
      'local/no-unstable-deps': 'error',
    },
  },
  {
    // IP guardrail: view components (.tsx) must NOT import the curriculum
    // skeleton — it's distilled from a named program's scope & sequence and may
    // only drive content generation in logic (.ts) files, never be displayed.
    // See docs/IP-CURRICULUM.md.
    files: ['**/*.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{
        group: ['*curriculum'],
        message: 'Do not display the curriculum scope & sequence (IP boundary). See docs/IP-CURRICULUM.md — use it only in .ts logic.',
      }] }],
    },
  },
])
