const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
module.exports = (env = {}) => ({
  mode: 'development',
  cache: false,
  devtool: 'source-map',
  optimization: {
    minimize: false,
  },
  target: 'web',
  entry: path.resolve(__dirname, './src/index.js'),
  // output: {
  //   path: path.resolve(__dirname, './dist'),
  //   publicPath: '/dist/'
  // },
  output: {
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.vue', '.jsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: { limit: 8192 },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new ModuleFederationPlugin({
      name: 'vue_app',
      filename: 'remoteEntry.js',
      exposes: {
        './Content': './src/components/Content',
        './Button': './src/components/Button',
        './App': './src/bootstrap',
      },
      shared: {
        vue: {
          singleton: true,
        },
        effector: { singleton: true },
        'effector-react': { singleton: true },
        'kill-port': {singleton: true}
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
    }),
    new VueLoaderPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 3004,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
});