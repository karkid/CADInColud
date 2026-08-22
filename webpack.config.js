const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname + "/public",
    entry: "./app.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: './js/app.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [{
                    from: './css/',
                    to: '../dist/css/'
                },
                {
                    from: './assets/media/',
                    to: '../dist/assets/media/'
                },
                {
                    from: './assets/fonts/',
                    to: '../dist/assets/fonts/'
                }
            ]
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    module: {
        rules: [{
            test: /\.js$/,
            include: /src/,
            exclude: /node_modules/,
            loader: "babel-loader",
        }]
    },
    resolve: {
        fallback: {
            assert: require.resolve('assert/'),
            process: require.resolve('process/browser')
        }
    },
    devServer: {
        static: path.resolve(__dirname, './dist/assets/media'),
        compress: true,
        port: 12000,
        open: true,
    },
    devtool: 'inline-source-map',
};
