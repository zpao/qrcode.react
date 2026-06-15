const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const jest = require('eslint-plugin-jest');
const prettier = require('eslint-plugin-prettier');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

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

module.exports = [
  {
    ignores: [
      'lib/',
      'node_modules/',
      'examples/iife/demo.js',
      'third-party/',
      'src/third-party/',
      '**/.DS_Store',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
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
