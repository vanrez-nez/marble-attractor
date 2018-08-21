const path = require('path');
const webpack = require("webpack");

const HtmlWebpackPlugin = require('html-webpack-plugin');

let package = require('../../package.json');

module.exports = {
    devtool: 'eval-cheap-module-source-map',
    entry: {
        index: './src/main.js',
    },
    devServer: {
        port: 8080,
        contentBase: path.join(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            },
            {
                test: /\.(styl|css)$/,
                use: [
                    {
                        // creates style nodes from JS strings
                        loader: "style-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        // translates CSS into CommonJS
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        // compiles Stylus to CSS
                        loader: "stylus-loader",
                    }
                    // Please note we are not running postcss here
                ]
            }
            ,
            {
                // Load all images as base64 encoding if they are smaller than 8192 bytes
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // On development we want to see where the file is coming from, hence we preserve the [path]
                            name: '[path][name].[ext]?hash=[hash:20]',
                            limit: 192
                        }
                    }
                ]
            }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin(package.globals),
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: true
        })
    ]
};
