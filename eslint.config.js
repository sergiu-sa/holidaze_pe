import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import testingLibrary from 'eslint-plugin-testing-library'
import jestDom from 'eslint-plugin-jest-dom'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'dist-ssr',
    'build',
    'coverage',
    'node_modules',
    'public',
    'src/assets',
    'playwright-report',
    'test-results',
  ]),

  // App source: React + TS, type-aware, strict.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactPlugin.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2023 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    rules: {
      // React 18 + TS — JSX runtime is auto, prop-types come from types.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 6,
        },
      ],


      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/first': 'error',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',

  
      'import/no-default-export': 'error',

      // Hygiene.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',

      // Brand: no rounded corners. Catches `rounded`, `rounded-md`, etc. in className strings.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(?:^|\\s)rounded(?:-[a-z0-9]+)*(?:\\s|$)/]",
          message:
            'No rounded corners — Holidaze uses hard edges (CLAUDE.md §3.2). Remove the `rounded*` utility.',
        },
      ],
    },
  },

  // Pages, routes, and lazy-loaded components need default exports for React.lazy / React Router.
  {
    files: [
      'src/pages/**/*.{ts,tsx}',
      'src/routes/**/*.{ts,tsx}',
      'src/components/intro/IntroCover.tsx',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Vitest unit/component tests.
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    extends: [
      testingLibrary.configs['flat/react'],
      jestDom.configs['flat/recommended'],
    ],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Playwright e2e tests live outside `src/` and don't run under tsconfig.app.json.
  {
    files: ['e2e/**/*.{ts,tsx}', 'playwright.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Build/config files: node, no type-aware linting (they live outside `src`).
  {
    files: ['*.config.{js,ts}', 'vite.config.ts', 'tailwind.config.ts', 'postcss.config.js'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      'import/no-default-export': 'off',
    },
  },
])
