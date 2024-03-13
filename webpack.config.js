const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
/**
 * entry
 * output
 * module
 * mode
 * plugins
 * devServer (port)
 */

module.exports = {
  entry: resolve(__dirname, "./fe/app.js"),
  output: {
    path: resolve(__dirname, "./fe/build"),
    filename: "bundle.[fullhash].js",
  },
  plugins: [new HtmlWebpackPlugin({
    template:resolve(__dirname, "./index.html")
  })],
  mode: process.env.NODE_ENV,
  devServer: {
    port: 2023,
  },
};
