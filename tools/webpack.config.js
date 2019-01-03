const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Webpack = require('webpack');
const Path = require('path');
const Fs = require("fs");
const AutoPrefixer = require('autoprefixer');
const CssNano = require('cssnano');
const Glob = require('glob');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const cheerio = require('cheerio');
const minify = require('html-minifier').minify;
const md5 = require('md5');

module.exports = (docfxProjectDir) => {
    const tsconfigPath = Path.join(docfxProjectDir, 'src/scripts/tsconfig.json');
    if (!Fs.existsSync(tsconfigPath)) {
        throw new Error(`${tsconfigPath} is missing.`);
    }

    const entryPath = Path.join(docfxProjectDir, 'src/scripts/index.ts');
    if (!Fs.existsSync(entryPath)) {
        throw new Error(`${entryPath} is missing.`);
    }

    const outputPath = Path.join(docfxProjectDir, './bin/_site/resources');
    if (!Fs.existsSync(outputPath)) {
        Fs.mkdirSync(outputPath);
    }

    const isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production';
    const mimoRootDir = Path.join(__dirname, '..');

    function PostProcessingPlugin() { }
    PostProcessingPlugin.prototype.apply = function (compiler) {
        compiler.hooks.afterEmit.tapAsync("PostProcessingPlugin", function (compilation, callback) {
            // Html minification options
            var minificationOptions = {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                decodeEntities: true,
                html5: true,
                minifyCSS: true,
                minifyJS: true,
                processConditionalComments: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                trimCustomFragments: true,
                useShortDoctype: true
            };

            // Function for replacing use elements
            function replaceUseElements(cheerioStatic) {
                cheerioStatic('svg > use').each((_, element) => {
                    // Replace elements 
                    var id = element.attribs['xlink:href'];
                    var symbol = $symbols(id);
                    var parent = cheerioStatic(element.parent);
                    parent.attr('viewBox', symbol[0].attribs['viewbox']);

                    parent.append(symbol.children().clone());
                    parent.children().remove('use');
                });
            }

            // Get sprite sheet
            var symbolsRaw = compilation.assets["sprite.svg"].source();
            var $symbols = cheerio.load(symbolsRaw);

            // Update search index - Inline svgs. Rename if in production mode.
            // Might be index.json, might be index.<hash>.json if DocFx didn't run between previous and current webpack builds.
            var searchIndexGlob = Path.join(docfxProjectDir, './bin/_site/resources/index*.json');
            var searchIndexFile = Glob.sync(searchIndexGlob)[0];
            var searchIndexJson = JSON.parse(Fs.readFileSync(searchIndexFile, "utf8"));
            for (var property in searchIndexJson) {
                if (searchIndexJson.hasOwnProperty(property)) {
                    var searchItem = searchIndexJson[property];
                    var snippetHtml = searchItem.snippetHtml;
                    var snippet = cheerio.load(snippetHtml);

                    replaceUseElements(snippet);
                    searchItem.snippetHtml = isProduction ? minify(snippet.html(), minificationOptions) : snippet.html();
                }
            }
            var resultSearchIndexJson = JSON.stringify(searchIndexJson);
            Fs.writeFileSync(searchIndexFile, resultSearchIndexJson);
            if (isProduction) {
                var newFileName = 'index.' + md5(resultSearchIndexJson) + '.json';

                // Add hash to index.json file name
                newFile = Path.join(docfxProjectDir, `./bin/_site/resources/${newFileName}`);
                Fs.renameSync(searchIndexFile, newFile);
            }

            // Update all pages - Inline svgs. Add hashes to srcs and hrefs and minify html if in production mode.
            var htmlFilesGlob = Path.join(docfxProjectDir, './bin/_site/**/*.html');
            var htmlFiles = Glob.sync(htmlFilesGlob);

            for (var i = 0; i < htmlFiles.length; i++) {
                var file = htmlFiles[i];
                var html = Fs.readFileSync(file, "utf8");

                // Parse html using cheerio
                const $ = cheerio.load(html);

                // Ignore html snippets, like tocs
                if ($('html').length === 0) {
                    continue;
                }

                // Replace use elements
                replaceUseElements($);

                var result;

                if (isProduction) {
                    // Insert hashes into bundle names
                    var jsBundleScriptElement = $('script[src*="/resources/bundle"][src$=".js"]');
                    var jsBundleSrc = jsBundleScriptElement.attr('src');
                    var jsBundleDir = jsBundleSrc.substring(0, jsBundleSrc.lastIndexOf('/') + 1);
                    var jsBundleSrcWithHash = jsBundleDir + 'bundle.' + compilation.namedChunks.get("bundle").contentHash["javascript"] + '.min.js';
                    jsBundleScriptElement.attr('src', jsBundleSrcWithHash);

                    var cssBundleScriptElement = $('link[href*="/resources/bundle"][href$=".css"]');
                    var cssBundleHref = cssBundleScriptElement.attr('href');
                    var cssBundleDir = cssBundleHref.substring(0, cssBundleHref.lastIndexOf('/') + 1);
                    var cssBundleHrefWithHash = cssBundleDir + 'bundle.' + compilation.namedChunks.get("bundle").contentHash["css/mini-extract"] + '.min.css';
                    cssBundleScriptElement.attr('href', cssBundleHrefWithHash);

                    // Insert hash into search index name
                    var searchIndexLinkElement = $('link[href*="/resources/index"][href$=".json"]');
                    var searchIndexHref = searchIndexLinkElement.attr('href');
                    var searchIndexDir = searchIndexHref.substring(0, searchIndexHref.lastIndexOf('/') + 1);
                    searchIndexLinkElement.attr('href', searchIndexDir + newFileName);

                    // Minify html
                    result = minify($.html(), minificationOptions);
                } else {
                    result = $.html();
                }

                // Write file
                Fs.writeFileSync(file, result);
            }

            callback();
        });
    };

    var plugins = [
        // Css files are referenced in ts files. They must be extracted into a css bundle.
        new MiniCssExtractPlugin({ filename: `[name].${isProduction ? '[contenthash].min.' : ''}css` }),

        // Webpack uses an incrementing digit for module ids by default, this means hashes can change unexpectedly -
        // https://webpack.js.org/guides/caching/
        new Webpack.HashedModuleIdsPlugin(),

        // TODO make sure not affected by minification
        // Add banner after minifying
        new Webpack.BannerPlugin({ banner: 'JeremyTCD.DocFx.Themes.Mimo, Copyright 2017 Jering', include: /^bundle\..*$/ }),

        new SpriteLoaderPlugin(),

        new PostProcessingPlugin()
    ];

    var result = {
        mode: isProduction ? 'production' : 'development', // Minification is enabled automatically for production
        entry: {
            // TODO can we use this pattern?: https://webpack.js.org/concepts/entry-points/#multi-page-application
            bundle: [entryPath]
        },
        output: {
            filename: `[name].${isProduction ? '[contenthash].min.' : ''}js`, // TODO ensure that this works after the bug fix is released - https://github.com/webpack/webpack/pull/8029
            path: outputPath,
            publicPath: '/resources/'
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
                    use: [{
                        loader: 'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename: 'sprite.svg'
                        }
                    },
                        'svgo-loader']
                },
                {
                    test: /\.ts$/,
                    use: 'ts-loader'
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
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
                }
            ]
        },
        plugins: plugins
    };

    return result;
};