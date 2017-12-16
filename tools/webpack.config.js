const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env) => {
    // Consider NODE_ENV from command line arguments and environment variables
    const isProduction = process.env.NODE_ENV == 'production' || env.NODE_ENV === 'production';

    var plugins = [
        // Css files are referenced in ts files. They must be extracted into a css bundle.
        new ExtractTextPlugin(`bundle.${isProduction ? '[contenthash].min.' : ''}css`),

        // Webpack uses an incrementing digit for module ids by default, this means hashes can change unexpectedly -
        // https://webpack.js.org/guides/caching/#module-identifiers
        new webpack.NamedModulesPlugin(),

        // Creates vendor.*js. Includes files specified in entry.
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),

        // Creates manifest.*js. Built in preset that extracts a manifest. Necessary for consistent hashes - 
        // https://webpack.js.org/guides/caching/#extracting-boilerplate
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),

        // Runs ts type checking in a separate process
        new ForkTsCheckerWebpackPlugin({
            tsconfig: path.join(__dirname, '../tsconfig.json')
        })
    ];

    // Minify if in production environment
    if (isProduction) {
        plugins.push(new UglifyJsPlugin());
    }

    // Add banner after minifying
    plugins.push(new webpack.BannerPlugin({ banner: 'JeremyTCD.DocFx.Themes.BasicBlog, Copyright 2017 JeremyTCD', include: /^bundle\..*$/ }));

    return {
        entry: {
            bundle: path.join(__dirname, '../scripts/index.ts'),
            vendor: ['jquery', 'anchor-js', 'lunr', 'mark.js', 'twbs-pagination']
        },
        output: {
            filename: `[name].${isProduction ? '[chunkhash].min.' : ''}js`,
            path: path.join(__dirname, '../dist/theme/styles'),
            publicPath: '/styles/'
        },
        externals: {
            jquery: 'jQuery'
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
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
                    ],
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
    }
};