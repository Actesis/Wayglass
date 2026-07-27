import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import lit from 'eslint-plugin-lit';
import wc from 'eslint-plugin-wc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/coverage/**',
      '**/dist/**',
      '**/.vitepress/cache/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/storybook-static/**',
      '**/test-results/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      lit,
      wc,
    },
    rules: {
      ...lit.configs.recommended.rules,
      ...wc.configs.recommended.rules,
    },
  },
  {
    files: ['apps/storybook/**/*.ts'],
    rules: {
      'lit/no-invalid-html': 'off',
    },
  },
  prettier,
);
