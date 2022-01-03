module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  plugins: ['react', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: '16.2.0',
    },
  },
  rules: {
    // Will use the TS version
    // 'no-unused-vars': ['error', {ignoreRestSiblings: true}],
    // Meh - don't agree with it
    'react/no-unescaped-entities': 'off',
    // Meh - I don't feel the need for all things to be const
    'prefer-const': 'off',
    // Not as helpful as it seems. I wa
    // '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': ['error', {ignoreRestSiblings: true}],
    '@typescript-eslint/no-inferrable-types': [
      'error',
      {ignoreParameters: true},
    ],
  },
};
