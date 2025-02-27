const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index',
  mode: 'development',
  resolve: {
    extensions: ['.js','.jsx','.mjs'],
  },
  output: {
    publicPath: 'auto',
         scriptType: 'text/javascript'
  },
  devServer: {
    port: 3003,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
  plugins: [
    new ModuleFederationPlugin({
      name: 'shared-store',
      filename: 'remoteEntry.js',
      library: { type: 'global', name: 'store' },
      exposes: {
        './Counter': './src/counter',
      },
      // shared: {
      //   effector: { singleton: true },
      //   'effector-react': { singleton: true },
      //   'kill-port': {singleton: true}
      // },
    }),
  ],
};
