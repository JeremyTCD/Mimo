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
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// Known issues
// - Loaders run twice, this is due to the extract-text-webpack-plugin https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/647
// - Sprite loader can't be used due to poor support on some browsers
// - ForkTsCheckerWebpackPlugin reports errors that tsc does not report

module.exports = (docfxProjectDir) => {
    const tsconfigPath = Path.join(docfxProjectDir, 'src/scripts/tsconfig.json');
    if (!Fs.existsSync(tsconfigPath)) {
        throw new Error(`${tsconfigPath} is missing.`);
    }

    const entryPath = Path.join(docfxProjectDir, 'src/scripts/index.ts');
    if (!Fs.existsSync(entryPath)) {
        throw new Error(`${entryPath} is missing.`);
    }

    const isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production';
    const outputPath = Path.join(docfxProjectDir, './bin/theme/styles');
    const mimoRootDir = Path.join(__dirname, '..');

    var plugins = [
        // TODO: This setting extracts the svg sprite sheet so it can be cached. Svg sprites are however, somewhat poorly implemented.
        // Chrome for example, randomly fails to display sprites - https://stackoverflow.com/questions/35049842/svgs-in-chrome-sometimes-dont-render.
        //
        // Combines svg files into an svg sprite
        //new SpriteLoaderPlugin({ plainSprite: true }),

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

        // TODO Runs ts type checking in a separate process, speeding up webpack rebuilds. However, sometimes outputs errors that aren't reported when simply running tsc or having ts-loader do the static 
        // type checking.
        //new ForkTsCheckerWebpackPlugin({
        //    tsconfig: tsconfigPath
        //})
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
            bundle: [entryPath],
            vendor: ['jquery', 'mark.js', 'twbs-pagination', 'smooth-scroll', 'clipboard', 'resize-observer-polyfill', 'domready', 'tippy.js', 'highlight.js',
                'intersection-observer', 'inversify']
        },
        output: {
            filename: `[name].${isProduction ? '[chunkhash].min.' : ''}js`,
            path: outputPath,
            publicPath: '/styles/'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            plugins: [new TsconfigPathsPlugin({ configFile: tsconfigPath })]
        },
        // Settings for resolving webpack loaders (like svgo-loader etc), does not seem necessary (webpack is probably searching for node_modules folders in the current directory and its parents)
        // resolveLoader: {
        //     modules: [nodeModulesDir]
        // },
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
                            loader: 'ts-loader'//,
                            //options: {
                            //    transpileOnly: true
                            //}
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
                                            // CssNano is a minifier plugin for postcss. 
                                            // - convertValues must be set to false or 0% will be converted to 0, messing up transitions in edge that start or end at 0%. see constants.scss.
                                            // - discardUnused must be set to false or keyframes get removed.
                                            result.push(CssNano({ convertValues: false, discardUnused: false }));
                                        }

                                        return result;
                                    }
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    // When serve.js <project> is run, the intention is always to utilize the styles contained in <serve.js dir>/../styles. This script allows mimo to be tested with
                                    // any project. Note that intellisense will be compromized for target projects.
                                    importer: (url, prev, done) => {
                                        let nodeModuleStylesPath = 'node_modules/mimo-website/dist/styles/';
                                        let index = url.indexOf(nodeModuleStylesPath);
                                        if (index > -1) {
                                            let substringStartIndex = index + nodeModuleStylesPath.length;
                                            let newPath = Path.join(mimoRootDir, `/styles/${url.substring(substringStartIndex)}`);
                                            return { file: newPath };
                                        }

                                        return { file: url };
                                    }
                                }
                            }
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