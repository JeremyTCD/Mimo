const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

var environment = process.env.NODE_ENV;
var isProduction = environment === 'production';

var plugins = [
    // Need to create a plugin for docfx that inserts files name according to environment
    new ExtractTextPlugin('bundle.' + 'css'), // (isProduction ? 'min.css' : 'css')),
    new webpack.ProvidePlugin({
        $: 'jquery',
        'window.jQuery': 'jquery',
        jQuery: 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    }),
    new webpack.BannerPlugin({ banner: 'JeremyTCD.DocFx.Themes.BasicBlog, Copyright 2017 JeremyTCD', include: /^bundle\..*$/ })
];

if (isProduction) {
    plugins.push(new UglifyJsPlugin());
}

module.exports = {
    entry: {
        vendor: ['jquery', 'anchor-js', 'lunr', 'mark.js', 'twbs-pagination'], 
        bundle: [path.join(__dirname, '../scripts/index.ts')]
    },
    output: {
        // Need to create a plugin for docfx that inserts files name according to environment
        // By doing so and adding hash to app scripts
        // vendor scripts will be cached even when app scripts are tweaked.
        filename: '[name].' + 'js', // (isProduction ? 'min.js' : 'js'),
        path: path.join(__dirname, '../dist/theme/styles'),
        publicPath: '/styles/'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.join(__dirname, '../node_modules')]
    },
    resolveLoader: {
        modules: [path.join(__dirname, '../node_modules')]
    },
    module: {
        rules: [
            {
                test: /search\.worker\.ts$/,
                use: 'worker-loader',
                exclude: ['node_modules']
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: ['node_modules']
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{ loader: 'css-loader', options: { minimize: isProduction } },
                    { loader: 'sass-loader' }]
                })
            },
            {
                test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
                use: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/,
                use: "file-loader"
            }
        ]
    },
    plugins: plugins
};