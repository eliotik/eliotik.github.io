// @ts-check
// ESLint flat config — drafted in T-12, activated (legacy deleted) in T-23.
//
// IMPORTANT: ESLint 8.57.0 auto-detects eslint.config.js when present (no
// env var needed). As a result, `pnpm lint` already uses this flat config once
// this file exists. The plan assumed legacy would stay active until T-23, but
// ESLint 8's auto-discovery mechanism overrides that assumption.
// See justification T-12.md §7 for full discussion.
//
// Porting notes (see docs/library-packages-upgrade/justifications/T-12.md):
//
// Plugin versions shipped with ESLint 8.57.0 era (T-12 does NOT bump versions):
//   @typescript-eslint/eslint-plugin  7.1.0  — legacy config format
//   eslint-plugin-astro               0.31.4 — legacy config format
//   eslint-plugin-jsx-a11y            6.8.0
//   astro-eslint-parser               0.16.3
//
// Because plugin configs at these versions use legacy `extends`-based
// composition, the flat-config blocks below manually expand each
// `plugin:x/recommended` into its constituent rules. Full equivalence
// (including proper type-checked rules) will be finalised in T-23 when
// plugins bump to their flat-config-native releases.

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astroPlugin from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';

// ---------------------------------------------------------------------------
// Shared globals — ported from .eslintrc.cjs  env: {node, browser, es2022}
// ---------------------------------------------------------------------------
// In legacy config, env: {node, browser} declared globals at the top level
// and applied to ALL file types including .astro. Flat config has no env
// shorthand; globals must be listed explicitly in each block that needs them.
const sharedGlobals = {
  // node globals
  process: 'readonly',
  module: 'readonly',
  require: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  exports: 'readonly',
  Buffer: 'readonly',
  global: 'readonly',
  // browser globals (subset covering actual usage in this codebase)
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  Event: 'readonly',
  CustomEvent: 'readonly',
  HTMLElement: 'readonly',
  Element: 'readonly',
  Node: 'readonly',
  NodeList: 'readonly',
  MutationObserver: 'readonly',
  IntersectionObserver: 'readonly',
  ResizeObserver: 'readonly',
  // NOTE: dataLayer (Google Tag Manager) is intentionally NOT declared here.
  // The legacy .eslintrc.cjs used env: {browser: true} which doesn't include
  // dataLayer, causing the no-undef error in Layout.astro:132. That error is
  // preserved in the flat config to maintain baseline parity. T-23 will fix it.
  // es2022 globals
  Promise: 'readonly',
  Map: 'readonly',
  Set: 'readonly',
  WeakMap: 'readonly',
  WeakSet: 'readonly',
  Symbol: 'readonly',
  Proxy: 'readonly',
  Reflect: 'readonly',
  Array: 'readonly',
  Object: 'readonly',
  String: 'readonly',
  Number: 'readonly',
  Boolean: 'readonly',
  RegExp: 'readonly',
  Error: 'readonly',
  TypeError: 'readonly',
  RangeError: 'readonly',
  Math: 'readonly',
  JSON: 'readonly',
  Date: 'readonly',
  parseInt: 'readonly',
  parseFloat: 'readonly',
  isNaN: 'readonly',
  isFinite: 'readonly',
  undefined: 'readonly',
  null: 'readonly',
};

// ---------------------------------------------------------------------------
// @typescript-eslint recommended rules — expanded from legacy `extends`
// ---------------------------------------------------------------------------
// plugin:@typescript-eslint/recommended uses legacy `extends` composition:
//   - configs.base                → parser + parserOptions (= languageOptions)
//   - configs['eslint-recommended'] → overrides[0] which applies to TS files
//     (*.ts, *.tsx, *.mts, *.cts ONLY) and turns OFF core ESLint rules
//     superseded by the TypeScript compiler
//   - configs['recommended']      → @typescript-eslint/* rules
//
// KEY SCOPING RULE: The eslint-recommended overrides (prefer-rest-params,
// prefer-spread, no-var, prefer-const, and the "turn off" rules) were ONLY
// applied to *.ts/tsx/mts/cts files in legacy config. They are split into two
// separate objects here to maintain that scoping in flat config.
//
// tsEslintCoreDisables — applies to TS files only (mirroring legacy overrides)
const tsEslintCoreDisables = {
  // Turn OFF core ESLint rules that TypeScript handles better
  'constructor-super': 'off',
  'getter-return': 'off',
  'no-const-assign': 'off',
  'no-dupe-args': 'off',
  'no-dupe-class-members': 'off',
  'no-dupe-keys': 'off',
  'no-func-assign': 'off',
  'no-import-assign': 'off',
  'no-new-symbol': 'off',
  'no-obj-calls': 'off',
  'no-redeclare': 'off',
  'no-setter-return': 'off',
  'no-this-before-super': 'off',
  'no-undef': 'off',
  'no-unreachable': 'off',
  'no-unsafe-negation': 'off',
  // Additional rules promoted by TS eslint-recommended
  'no-var': 'error',
  'prefer-const': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
};

// tsEslintRules — the @typescript-eslint/* rules themselves
// These apply to all JS/TS files, same as legacy (where they came from the
// top-level extends, not from the scoped overrides).
const tsEslintRules = {
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/ban-types': 'error',
  'no-array-constructor': 'off',
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  'no-loss-of-precision': 'off',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
};

export default [
  // -------------------------------------------------------------------------
  // Global ignores (equivalent to .eslintignore / ignorePatterns in legacy)
  // -------------------------------------------------------------------------
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'docs/library-packages-upgrade/baseline/',
    ],
  },

  // -------------------------------------------------------------------------
  // Block 1a — eslint:recommended for all JS/TS source files
  // Applies: no-undef, no-mixed-spaces-and-tabs, and other recommended rules
  // -------------------------------------------------------------------------
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      globals: sharedGlobals,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // -------------------------------------------------------------------------
  // Block 1b — TypeScript plugin rules for all JS/TS files
  // Applies: @typescript-eslint/* rules + parser
  // -------------------------------------------------------------------------
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsEslintRules,
    },
  },

  // -------------------------------------------------------------------------
  // Block 1c — TypeScript-specific core rule overrides (TS files only)
  // Mirrors legacy: @typescript-eslint/eslint-recommended overrides applied
  // only to *.ts, *.tsx, *.mts, *.cts — NOT to .js or virtual .astro/*.js
  // -------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      ...tsEslintCoreDisables,
    },
  },

  // -------------------------------------------------------------------------
  // Block 2 — Legacy config self-reference (.eslintrc.{js,cjs})
  // Equivalent to .eslintrc.cjs overrides[0]: treat as CommonJS script
  // -------------------------------------------------------------------------
  {
    files: ['.eslintrc.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
  },

  // -------------------------------------------------------------------------
  // Block 3a — Inline script blocks inside .astro files (virtual *.astro/*.js)
  // The astro processor extracts inline <script> blocks as virtual JS/TS files.
  // Block 1a/1b also match these (since they end in .js/.ts) — the globals
  // and eslint:recommended rules therefore already apply.
  // This block is a no-op placeholder; documented for clarity.
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Block 3b — Astro files
  // Ports:  plugin:astro/recommended  +  plugin:astro/jsx-a11y-recommended
  //
  // Both configs use legacy format; rules are expanded inline.
  //   astroPlugin.configs.recommended.rules  → 7 astro/* rules
  //   astroPlugin.configs['jsx-a11y-recommended'].rules → 34 astro/jsx-a11y/* rules
  //
  // eslint:recommended rules are also applied here (js.configs.recommended)
  // to match legacy behaviour: top-level `extends: eslint:recommended` in
  // .eslintrc.cjs applied to ALL files, including .astro.
  //
  // The `.astro` processor is required to lint inline script blocks within
  // .astro files. In legacy config this was handled automatically via the
  // plugin's `overrides` block; in flat config it must be declared explicitly.
  // -------------------------------------------------------------------------
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
      globals: sharedGlobals,
    },
    plugins: {
      astro: astroPlugin,
    },
    processor: astroPlugin.processors['.astro'],
    rules: {
      // eslint:recommended rules also apply to .astro files (mirrors legacy top-level extends)
      ...js.configs.recommended.rules,
      // plugin:astro/recommended rules
      ...astroPlugin.configs.recommended.rules,
      // plugin:astro/jsx-a11y-recommended rules
      ...astroPlugin.configs['jsx-a11y-recommended'].rules,
    },
  },
];
