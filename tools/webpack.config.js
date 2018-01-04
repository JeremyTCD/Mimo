const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Webpack = require('webpack');
const Path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const FileSystem = require("fs");

module.exports = (env) => {
    // Consider NODE_ENV from command line arguments and environment variables
    const isProduction = process.env.NODE_ENV == 'production' || (env && env.NODE_ENV === 'production');

    var plugins = [
        new Webpack.ProvidePlugin({
            $: 'jquery',
            'window.jQuery': 'jquery',
            jQuery: 'jquery'
        }),

        // Css files are referenced in ts files. They must be extracted into a css bundle.
        new ExtractTextPlugin(`bundle.${isProduction ? '[contenthash].min.' : ''}css`),

        // Webpack uses an incrementing digit for module ids by default, this means hashes can change unexpectedly -
        // https://webpack.js.org/guides/caching/#module-identifiers
        new Webpack.NamedModulesPlugin(),

        // Creates vendor.*js. Includes files specified in entry.
        new Webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),

        // Creates manifest.*js. Built in preset that extracts a manifest. Necessary for consistent hashes - 
        // https://webpack.js.org/guides/caching/#extracting-boilerplate
        new Webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        }),

        // Runs ts type checking in a separate process
        new ForkTsCheckerWebpackPlugin({
            tsconfig: Path.join(__dirname, '../tsconfig.json')
        })
    ];

    // Minify if in production environment
    if (isProduction) {
        plugins.push(new UglifyJsPlugin());
        plugins.push(function () {
            this.plugin("done", function (statsData) {
                debugger;
                var stats = statsData.toJson();

                if (!stats.errors.length) {
                    // Replace script files with hash-appended names
                    var file = Path.join(__dirname, '../dist/theme/partials/scripts.tmpl.partial');
                    var html = FileSystem.readFileSync(file, "utf8");
                    var htmlOutput = html.replace(
                        /bundle\.js/,
                        stats.assetsByChunkName.bundle.filter(name => name.endsWith('.js'))[0]);
                    htmlOutput = htmlOutput.replace(
                        /vendor\.js/,
                        stats.assetsByChunkName.vendor
                    );
                    htmlOutput = htmlOutput.replace(
                        /manifest\.js/,
                        stats.assetsByChunkName.manifest
                    );
                    FileSystem.writeFileSync(file, htmlOutput);

                    // Replace style file names with hash-appended names
                    file = Path.join(__dirname, '../dist/theme/partials/head.tmpl.partial');
                    html = FileSystem.readFileSync(file, "utf8");
                    htmlOutput = html.replace(
                        /bundle\.css/,
                        stats.assetsByChunkName.bundle.filter(name => name.endsWith('.css'))[0]);
                    FileSystem.writeFileSync(file, htmlOutput);
                }
            });
        });
    }

    // Add banner after minifying
    plugins.push(new Webpack.BannerPlugin({ banner: 'JeremyTCD.DocFx.Themes.BasicBlog, Copyright 2017 JeremyTCD', include: /^bundle\..*$/ }));

    return {
        entry: {
            // Bundle must be an array so other sources can be added to it (see serve.js)
            bundle: [Path.join(__dirname, '../scripts/index.ts')],
            vendor: ['jquery', 'mark.js', 'twbs-pagination']
        },
        output: {
            filename: `[name].${isProduction ? '[chunkhash].min.' : ''}js`,
            path: Path.join(__dirname, '../dist/theme/styles'),
            publicPath: '/styles/'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [Path.join(__dirname, '../node_modules')]
        },
        resolveLoader: {
            modules: [Path.join(__dirname, '../node_modules')]
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