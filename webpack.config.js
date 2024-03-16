const { resolve } = require("path");
const fs = require("fs");
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
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "./index.html"),
    }),
  ],
  mode: process.env.NODE_ENV,
  devServer: {
    port: 2023,
    server: {
      type: "https",
      options: {
        cert: fs.readFileSync(resolve(__dirname, "./be/localhost.crt")),
        key: fs.readFileSync(resolve(__dirname, "./be/localhost.key")), // 你的私钥路径
      },
    },
  },
};
