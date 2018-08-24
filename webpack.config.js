const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    index: './public/js/index.js',
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'public/js/dist'),
  },
  mode: 'development',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
};
