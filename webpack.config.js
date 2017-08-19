var webpack = require('webpack');
 
module.exports = {
  entry: './Root.jsx',
  output: {path: __dirname, filename: 'bundle.js' },
 
  module: {
    loaders: [
      { test: /.jsx?$/, loader: 'babel-loader', exclude: /node_modules/, query: { presets: ['es2016', 'react'] } },
      { test: /\.css$/, loader: 'style-loader' }, 
      { test: /\.css$/, loader: 'css-loader', query: { modules: true, localIdentName: '[name]__[local]___[hash:base64:5]' } }
    ]
  },
};
