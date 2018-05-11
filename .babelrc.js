const loose = true;

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        loose,
        targets: {
          browsers: ['>0.25%']
        },
      }
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose }],
    ['@babel/plugin-proposal-object-rest-spread', { loose }],
    ['transform-react-remove-prop-types', { mode: 'unsafe-wrap' }],
  ]
};
