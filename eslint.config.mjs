import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import gts from 'gts';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['**/node_modules', '**/dist/', '**/*.json', 'src/test.ts']),
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.browser,
        ...globals.jasmine,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...js.configs.all.rules,
      'node/no-unpublished-import': 'off',
      'node/no-unpublished-require': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: gts,
    rules: {
      'no-unused-vars': 'off',
      'no-inline-comments': 'off',
      'new-cap': ['error', { capIsNewExceptionPattern: '^@.' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
