import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const tsFiles = ['**/*.{ts,tsx,mts,cts}'];

const tsRecommended = tsPlugin.configs['flat/recommended'].map((config) => ({
  ...config,
  files: config.files || tsFiles,
  languageOptions: {
    ...config.languageOptions,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parser: tsParser,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      ecmaFeatures: {
        ...config.languageOptions?.parserOptions?.ecmaFeatures,
        jsx: true,
      },
    },
  },
}));

export default [
  {
    ignores: [
      'lib/',
      'node_modules/',
      'website/iife/demo.js',
      'third-party/',
      'src/third-party/',
      '**/.DS_Store',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ...tsRecommended,
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__test__/**/*.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
    ],
    ...jest.configs['flat/recommended'],
  },
  {
    rules: {
      'prefer-const': 'off',
    },
  },
  {
    files: tsFiles,
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {ignoreRestSiblings: true, caughtErrors: 'none'},
      ],
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {ignoreParameters: true},
      ],
    },
  },
  {
    plugins: {
      prettier,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
];
