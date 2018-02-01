const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Webpack = require('webpack');
const Path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Fs = require("fs");
//const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const AutoPrefixer = require('autoprefixer');
const CssNano = require('cssnano');
const Glob = require('glob');

module.exports = (docfxProjectDir, nodeModulesDir) => {
    // TODO duplicated logic
    const isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production';

    const scriptsCustomIndex = Glob.sync(Path.join(docfxProjectDir, 'src/customizations/scripts/customIndex.*'))[0];
    const stylesCustomIndex = Glob.sync(Path.join(docfxProjectDir, 'src/customizations/styles/customIndex.*'))[0];

    var plugins = [
        // TODO: This setting extracts the svg sprite sheet so it can be cached. Svg sprites are however, somewhat poorly implemented.
        // Chrome for example, randomly fails to display sprites - https://stackoverflow.com/questions/35049842/svgs-in-chrome-sometimes-dont-render.
        //
        // Combines svg files into an svg sprite
        //new SpriteLoaderPlugin({ plainSprite: true }),
        // Used to add requires for custom files
        new Webpack.DefinePlugin({
            SCRIPTS_CUSTOM_INDEX: scriptsCustomIndex ? `"${scriptsCustomIndex}"` : false,
            STYLES_CUSTOM_INDEX: stylesCustomIndex ? `"${stylesCustomIndex}"` : false
        }),

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

    if (isProduction) {
        // Minify
        plugins.push(new UglifyJsPlugin());
        // Replace script files with hash-appended names 
        plugins.push(function () {
            this.plugin("done", function (statsData) {
                var stats = statsData.toJson();

                if (!stats.errors.length) {
                    var searchGlob = Path.join(docfxProjectDir, './bin/_site/**/*.html');
                    var files = Glob.sync(searchGlob);

                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];

                        var html = Fs.readFileSync(file, "utf8");
                        // TODO can combine replace calls to avoid repeating logic
                        htmlOutput = html.
                            replace(
                            /<(?:script|link).*?(?:src|href)\s*=\s*".*?\/(([^\/]*?)(?:\..+?)*(\.[a-zA-Z]+))"\s*>/g, // script tags cannot be self closing
                            (match, s1, s2, s3) => {
                                var assets = stats.assetsByChunkName[s2];

                                if (assets) {

                                    var newFile = assets;
                                    if (typeof assets !== 'string') {
                                        newFile = assets.filter(name => name.endsWith(s3))[0]
                                    }

                                    return match.replace(s1, newFile);
                                } else {
                                    return match;
                                }

                            });
                        Fs.writeFileSync(file, htmlOutput);
                    }
                }
            });
        });
    }

    // Add banner after minifying
    plugins.push(new Webpack.BannerPlugin({ banner: 'JeremyTCD.DocFx.Themes.Mimo, Copyright 2017 JeremyTCD', include: /^bundle\..*$/ }));

    var result = {
        devServer: {
            inline: false
        },
        entry: {
            // Bundle must be an array so other sources can be added to it (see serve.js)
            bundle: [Path.join(__dirname, '../scripts/index.ts')],
            vendor: ['jquery', 'mark.js', 'twbs-pagination', 'smooth-scroll', 'clipboard', 'resize-observer-polyfill', 'domready', 'tippy.js']
        },
        output: {
            filename: `[name].${isProduction ? '[chunkhash].min.' : ''}js`,
            path: Path.join(docfxProjectDir, './bin/theme/styles'),
            publicPath: '/styles/'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [nodeModulesDir]
        },
        resolveLoader: {
            modules: [nodeModulesDir]
        },
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: 'svg-sprite-loader'//,
                            // TODO see SpriteLoaderPlugin
                            // options: { extract: true }
                        },
                        { loader: 'svgo-loader' }
                    ]
                },
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
                        use: [
                            {
                                loader: 'css-loader'
                            },
                            {
                                // Set of tools for processing css: https://github.com/postcss
                                loader: 'postcss-loader',
                                // Plugin that adds css prefixes: https://github.com/postcss/autoprefixer
                                // Browsers to add prefixes for specified using: https://github.com/ai/browserslist
                                options: {
                                    plugins: () => {
                                        var result = [AutoPrefixer({ browsers: ['last 3 versions', '> 1%'] })];
                                        if (isProduction) {
                                            // CssNano is a minifier plugin for postcss. convertValues must be set to false or 0% will be converted to 0, messing up transitions in edge that start or end at 0%.
                                            // see constants.scss.
                                            result.push(CssNano({ convertValues: false }));
                                        }

                                        return result;
                                    }
                                }
                            },
                            { loader: 'sass-loader' }
                        ]
                    })
                },
                {
                    test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.(ttf|eot)(\?v=[0-9].[0-9].[0-9])?$/,
                    use: "file-loader"
                }
            ]
        },
        plugins: plugins
    }

    // Enable source map for dev
    if (!isProduction) {
        result.devtool = 'source-map';
    }

    return result;
};