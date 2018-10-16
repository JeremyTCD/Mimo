const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Webpack = require('webpack');
const Path = require('path');
const Fs = require("fs");
const AutoPrefixer = require('autoprefixer');
const CssNano = require('cssnano');
const Glob = require('glob');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (docfxProjectDir) => {
    const tsconfigPath = Path.join(docfxProjectDir, 'src/scripts/tsconfig.json');
    if (!Fs.existsSync(tsconfigPath)) {
        throw new Error(`${tsconfigPath} is missing.`);
    }

    const entryPath = Path.join(docfxProjectDir, 'src/scripts/index.ts');
    if (!Fs.existsSync(entryPath)) {
        throw new Error(`${entryPath} is missing.`);
    }

    const outputPath = Path.join(docfxProjectDir, './bin/theme/styles');
    if (!Fs.existsSync(outputPath)) {
        Fs.mkdirSync(outputPath);
    }

    const isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production';
    const mimoRootDir = Path.join(__dirname, '..');

    var plugins = [
        // Css files are referenced in ts files. They must be extracted into a css bundle.
        new MiniCssExtractPlugin({ filename: `[name].${isProduction ? '[contenthash].min.' : ''}css` }),

        // Webpack uses an incrementing digit for module ids by default, this means hashes can change unexpectedly -
        // https://webpack.js.org/guides/caching/
        new Webpack.HashedModuleIdsPlugin(),

        // TODO make sure not affected by minification
        // Add banner after minifying
        new Webpack.BannerPlugin({ banner: 'JeremyTCD.DocFx.Themes.Mimo, Copyright 2017 JeremyTCD', include: /^bundle\..*$/ })
    ];

    if (isProduction) {
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
                                            newFile = assets.filter(name => name.endsWith(s3))[0];
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

    var result = {
        mode: isProduction ? 'production' : 'development', // Minification is enabled automatically for production
        entry: {
            // TODO can we use this pattern?: https://webpack.js.org/concepts/entry-points/#multi-page-application
            bundle: [entryPath]
        },
        output: {
            filename: `[name].${isProduction ? '[contenthash].min.' : ''}js`, // TODO ensure that this works after the bug fix is released - https://github.com/webpack/webpack/pull/8029
            path: outputPath,
            publicPath: '/styles/'
        },
        optimization: {
            // Creates runtime~bundle.js. Necessary for consistent hashes for caching
            // https://webpack.js.org/guides/caching/
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        resolve: {
            extensions: ['.ts', '.js'],
            // When resolving from node_modules, typically importing .js (compiled .ts) files, so must specify extensions.
            plugins: [new TsconfigPathsPlugin({ configFile: tsconfigPath, extensions: ['.ts', '.js'] })]
        },
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: ['svg-sprite-loader', 'svgo-loader']
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader'
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
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
    };

    return result;
};