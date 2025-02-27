const HtmlWebpackPlugin = require("html-webpack-plugin");
const {ModuleFederationPlugin} = require("webpack").container;
const ExternalTemplateRemotesPlugin = require("external-remotes-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    static: path.join(__dirname, "dist"),
    port: 3001,
  },
  output: {
    publicPath: "auto",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "host-app",
      remotes: {
        reactApp: "react_app@[reactAppUrl]/remoteEntry.js",
        reactAppVite: `promise import("http://localhost:3005/assets/remoteEntry.js")`,
        vueApp: "vue_app@[vueAppUrl]/remoteEntry.js",
        vueApp: "vue_app@[vueAppUrl]/remoteEntry.js",
        store: `store@http://localhost:3003/remoteEntry.js`,
      },
      shared: {react: {singleton: true}, "react-dom": {singleton: true}, effector: { singleton: true },
      'effector-react': { singleton: true }, 'kill-port': {singleton: true}},
    }),
    new ExternalTemplateRemotesPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};

