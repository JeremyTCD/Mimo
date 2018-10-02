const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const chokidar = require('chokidar');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const webpackConfig = require('./webpack.config.js');
const Parser = require('./parser');
const Builder = require('./builder');

async function triggerWebpackRecompilation() {
    // Really dirty, just reading and saving to trigger recompilation.
    // Chose a file that will always exists and is quite small though.
    var indexTsPath = path.join(__dirname, '../scripts/index.ts');
    var content = fs.readFileSync(indexTsPath, "utf8");
    fs.writeFileSync(indexTsPath, content);
}

async function tryBuildBasicBin(builder) {
    try {
        await builder.buildBasicBin();
    } catch (err) {
        console.log(err);
        console.log('serve: Failed to build basic bin, watcher will continue to watch.');
    }
}

// Builds base dist then builds docfx site using just base dist. Serves pipelineable resources using webpack dev server.
async function serve() {
    const isProduction = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production';

    // Set debug mode
    const debug = argv.d ? true : false;

    // Initialize parser
    var parser = new Parser(debug);

    // Set docfx project directory
    var docfxProjectDir = parser.getProjectDir();

    // Initialize builder
    var builder = new Builder(docfxProjectDir, debug);

    // Initial build
    await builder.cleanBin();
    await tryBuildBasicBin(builder);

    // Start watcher for simple files
    // Note: If all of these directories are watched and one of them does not exist, chokidar fails silently - https://github.com/paulmillr/chokidar/issues/346
    var foldersToWatch = [path.join(docfxProjectDir, 'src'),
        path.join(__dirname, '../templates'),
        path.join(__dirname, '../misc')];
    for (var i = foldersToWatch.length - 1; i >= 0; i--) {
        if (!fs.existsSync(foldersToWatch[i])) {
            foldersToWatch.splice(i, 1);
        }
    }

    // If chokidar is set to watch a specific file and the file is written over (this happens when you save changes to the file), 
    // chokidar will no longer watch the file. Therefore, to watch a specific file, a glob must be used - https://github.com/paulmillr/chokidar/issues/601#issuecomment-299198825.
    foldersToWatch.push(path.join(docfxProjectDir, '/[d]ocfx.json'));

    const watcher = chokidar.watch(
        foldersToWatch,
        {
            ignored: [
                path.join(docfxProjectDir, 'src/scripts'), // Watched by webpack
                path.join(docfxProjectDir, 'src/styles') // Watched by webpack
            ],
            ignoreInitial: true // TODO Chokidar isn't firing a ready event after add/adddir events, this is a workaround that ignores add/adddir events
        });
    var building = false;
    var pendingBuild = true;
    watcher.on('all', async () => {
        if (building) {
            // Regardless of how many build triggering events occur while a build is in progress,
            // only one more build needs to occur
            pendingBuild = true;
        } else {
            pendingBuild = true;
            while (pendingBuild) {
                pendingBuild = false;
                building = true;
                await tryBuildBasicBin(builder);

                building = false;
            }

            // TODO In production mode, webpack is configured to append hashes to bundles. This necessitated a webpack plugin that manually replaces bundle 
            // urls in _site's html files at the end of each webpack compilation. This means that after docfx build runs and _site's html files are 
            // regenerated, they no longer contain the correct bundle links. It is possible to manually replace the urls after each docfx build. This should
            // be attempted - carefully. Node's asynchronous model could result in the read (reading "current" bundle file names) and the write (overwriting
            // bundle names in html files) not being atomic, need to figure out how to ensure that this does not happen.
            if (isProduction) {
                await triggerWebpackRecompilation();
            } else {
                // Manually trigger refresh https://github.com/webpack/webpack-dev-server/issues/166
                server.sockWrite(server.sockets, 'ok');
            }
        }
    });

    // TODO doesn't fire
    watcher.on('ready', () => {
        console.log("watcher ready");

        if (debug) {
            console.log(`*** Watching these simple Files and Directories ***`);
            var watchedPaths = watcher.getWatched();
            Object.keys(watchedPaths).forEach((dir) => {
                console.log(`Directory: ${dir}`);
                watchedPaths[dir].forEach((file) => {
                    console.log(`    File/Directory: ${file}`);
                });
            });
        }
    });


    // Start webpack-dev-server
    console.log(`start - webpack serve`);
    var config = webpackConfig(docfxProjectDir);
    config.entry.bundle.unshift("webpack-dev-server/client?http://localhost:8080/"); // https://github.com/webpack/docs/wiki/webpack-dev-server#inline-mode-with-nodejs-api
    const compiler = webpack(config);
    const server = new webpackDevServer(compiler,
        {
            contentBase: path.join(docfxProjectDir, './bin/_site'),
            publicPath: '/styles/',
            compress: isProduction,
            stats: debug ? 'verbose' : 'errors-only',
            proxy: {
                // E.g, redirects /contact to /contact.html. This is something most servers do by default to allow for more readable links.
                "/**/+([^\.])": {
                    target: "http://localhost:8080",
                    pathRewrite: function (path, req) { return `${path}.html` }
                }
            }
        });
    server.listen(8080, "127.0.0.1", function () {
        console.log("Starting server on http://localhost:8080");
    });
}

serve();