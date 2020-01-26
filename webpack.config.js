const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SpritePlugin = require('svg-sprite-loader/plugin');

module.exports = (env, argv) => {
  const config = {
    devtool: "inline-source-map",
    sourceMap: true
  }
  if (argv.mode === "production") {
    config.devtool = "";
    config.sourceMap = false;
  }

  return {
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
      path: path.resolve(__dirname, "server/public"),
      publicPath: "/",
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.svg$/,
          loader: "svg-sprite-loader",
          options: {
            extract: true,
          }
        },
        {
          test: /\.(jpg|jpeg|png)$/,
          loader: "file-loader",
          options: {
            name: 'assets/img/[name].[ext]',
          }
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          loader: "file-loader",
          options: {
            name: 'assets/fonts/[name].[ext]',
          }
        },
        {
          test: /\.(css|scss)$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: config.sourceMap,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: config.sourceMap,
              },
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ["*", ".js", ".jsx"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Posts",
        filename: "index.html",
        template: path.resolve(__dirname, "src/index.html")
      }),
      new webpack.HotModuleReplacementPlugin(),
      new SpritePlugin({ plainSprite: true }),
    ],
    devServer: {
      historyApiFallback: true,
      contentBase: path.join(__dirname, 'server/public'),
      hot: true,
      port: 9000,
      proxy: {
        '/api*': 'http://localhost:3000'
      }
    },
    devtool: config.devtool,
  };
};
