const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index',
  mode: 'production',
  target: 'web',
  devtool: 'eval-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    publicPath: 'auto',
         scriptType: 'text/javascript'
  },
  optimization: {
    minimize: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512_000,
    maxAssetSize: 512_000
  },
  module: {
    rules: [
      {
        test: /\.svg/,
        type: 'asset/resource'
      },
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            ["@babel/preset-react", {"runtime": "automatic"}]
          ],
        },
      },
    ],
  },
  plugins: [
    // To learn more about the usage of this plugin, please visit https://webpack.js.org/plugins/module-federation-plugin/
    new ModuleFederationPlugin({
      name: 'react_app',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      remotes: {
        reactAppVite: `promise import("http://localhost:3005/assets/remoteEntry.js")`,
        store: `store@http://localhost:3003/remoteEntry.js`,
      },
      shared: { 
        react: { singleton: true }, 'react-dom': { singleton: true },   
        effector: { singleton: true },
        'effector-react': { singleton: true },
        'kill-port': {singleton: true}
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 3002,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
};
