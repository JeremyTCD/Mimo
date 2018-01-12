const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const chokidar = require('chokidar');
const webpackConfig = require('./webpack.config.js');
const buildBase = require('./buildBase');
const docfxBuild = require(`./docfxBuild`);
const fs = require('fs');

async function tryBuild(docfxProjectDir, debug) {
    try {
        await buildBase(docfxProjectDir, debug);
        await docfxBuild(docfxProjectDir, debug);
    } catch (err) {
        // do nothing
    }
}

// Builds base dist then builds docfx site using just base dist. Serves pipelineable resources using webpack dev server.
async function serveDev() {
    // Set debug mode
    var debug = argv.d ? true : false;

    // Set docfx project directory
    if (!argv.p) {
        throw "Docfx project directory must be specified";
    }
    var docfxProjectDir = argv.p.trim();
    if (!path.isAbsolute(docfxProjectDir)) {
        docfxProjectDir = path.join(__dirname, docfxProjectDir);
    }
    if (!fs.existsSync(docfxProjectDir)) {
        throw `Docfx project directory ${docfxProjectDir} does not exist`;
    }
    if (debug) {
        console.log(`serveDev: Docfx project directory set to ${docfxProjectDir}`);
    }

    // Set node modules directory
    if (!argv.n) {
        throw "node_modules directory must be specified";
    }
    var nodeModulesDir = argv.n.trim();
    if (!path.isAbsolute(nodeModulesDir)) {
        nodeModulesDir = path.join(nodeModulesDir, docfxProjectDir);
    }
    if (!fs.existsSync(nodeModulesDir)) {
        throw `node_modules directory ${nodeModulesDir} does not exist`;
    }
    if (debug) {
        console.log(`serveDev: node_modules directory set to ${nodeModulesDir}`);
    }

    // Initial build
    await tryBuild(docfxProjectDir, debug);

    // Start watcher for simple files
    // Note: If all of these directories are watched and one of them does not exist, chokidar fails silently - https://github.com/paulmillr/chokidar/issues/346
    var foldersToWatch = [docfxProjectDir,
        path.join(__dirname, '../templates'),
        path.join(__dirname, '../plugins'),
        path.join(__dirname, '../fonts'),
        path.join(__dirname, '../misc')];
    for (var i = foldersToWatch.length - 1; i >= 0; i--) {
        if (!fs.existsSync(foldersToWatch[i])) {
            foldersToWatch.splice(i, 1);
        }
    }
    var watcher = chokidar.watch(
        foldersToWatch,
        {
            ignored: [path.join(docfxProjectDir, 'obj'), path.join(docfxProjectDir, 'bin')]
        });
    var building = false;
    var pendingBuild = true;
    watcher.on('ready', () => {
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
                    await tryBuild(docfxProjectDir, themeDir, debug);
                    building = false;
                }

                // Manually trigger refresh https://github.com/webpack/webpack-dev-server/issues/166
                // TODO does not work after serveBuild fails once (even when subsequent serveBuilds succeed)
                server.sockWrite(server.sockets, 'ok');
            }
        });

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
    var config = webpackConfig();
    config.entry.bundle.unshift("webpack-dev-server/client?http://localhost:8080/");
    config.resolve.modules.unshift(nodeModulesDir);
    const compiler = webpack(config);
    const server = new webpackDevServer(compiler,
        {
            contentBase: path.join(docfxProjectDir, './bin/_site'),
            publicPath: '/styles/',
            compress: false,
            stats: debug ? 'verbose' : 'errors-only'
        });
    server.listen(8080, "127.0.0.1", function () {
        console.log("Starting server on http://localhost:8080");
    });
}

serveDev();