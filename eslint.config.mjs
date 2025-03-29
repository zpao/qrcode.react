import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jest from 'eslint-plugin-jest';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: [
      'lib/',
      'node_modules/',
      'examples/iife/demo.js',
      'src/third-party/',
    ],
  },
  eslint.configs.recommended,
  react.configs.flat.recommended,
  {
    settings: {
      react: {
        version: '19',
      },
    },
  },
  // react hooks plugin doesn't have a flat config :/
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },
  tseslint.configs.recommendedTypeChecked,
  prettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Disable type aware linting for config files, don't expect them to be mjs
  {
    files: ['*.{js,mjs,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      'no-undef': 'off',
    },
  },
  // Jest config
  {
    files: ['src/**/*.test.tsx'],
    ...jest.configs['flat/recommended'],
  },
  // Lastly, override recommended rules that aren't ideal
  {
    rules: {
      // Will use the TS version
      // 'no-unused-vars': ['error', {ignoreRestSiblings: true}],
      // Meh - don't agree with it
      'react/no-unescaped-entities': 'off',
      // This rule doesn't seem to be compatible with forwardRef
      'react/prop-types': 'off',
      // Meh - I don't feel the need for all things to be const
      'prefer-const': 'off',
      // Not as helpful as it seems. I wa
      // '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {ignoreRestSiblings: true},
      ],
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {ignoreParameters: true},
      ],
    },
  }
);
