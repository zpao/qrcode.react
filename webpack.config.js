// This is used to compile the example

const path = require('path');

module.exports = {
  entry: './examples/demo.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'examples'),
  },
  module: {
    rules: [{test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}],
  },
  target: 'web',
};
