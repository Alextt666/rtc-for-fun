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
    filename: "bundle.js",
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
        cert: fs.readFileSync(resolve(__dirname, "./be/certificate/localhost.crt")),
        key: fs.readFileSync(resolve(__dirname, "./be/certificate/localhost.key")), // 你的私钥路径
      },
    },
  },
};
