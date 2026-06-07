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
])
