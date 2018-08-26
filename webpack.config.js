const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
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
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new CopyWebpackPlugin([{
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
        ]),
    ],
    module: {
        rules: [{
            test: /\.js$/,
            include: /src/,
            exclude: /node_modules/,
            loader: "babel-loader",
        }]
    },
    devServer: {
        contentBase: path.resolve(__dirname, './dist/assets/media'),
        compress: true,
        port: 12000,
        stats: 'errors-only',
        open: true,
        inline: true
    },
    devtool: 'inline-source-map',
};