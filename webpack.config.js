// This is used to compile the example

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  entry: './examples/demo.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'examples'),
  },
  module: {
    rules: [{test: /\.tsx?$/, exclude: /node_modules/, loader: 'babel-loader'}],
  },
  target: 'web',
  mode: 'production',
};
