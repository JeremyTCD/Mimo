const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './scripts/index.ts',
    output: {
        filename: 'bundle.js',
        path: "./bin/styles"
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{ loader: "css-loader" },
                    { loader: "sass-loader" }]
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "bundle.css"
        }),
        new CopyWebpackPlugin([
            { from: './fonts', to: '../fonts' },
            { from: './misc', to: '../misc'},
            { from: './templates', to: '../'},
            { from: './common.js', to: '../common.js'}
        ]),
        new webpack.ProvidePlugin({
            $:'jquery',
            'window.jQuery': 'jquery'
        })
    ]
};