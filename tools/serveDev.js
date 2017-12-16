const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const chokidar = require('chokidar');
const webpackConfig = require('./webpack.config.js');
const buildBaseDist = require('./buildBaseDist');
const docfxBuild = require(`./docfxBuild`);

async function tryBuild(docfxProjectDir, themeDir, logLevel) {
    try {
        await buildBaseDist(logLevel);
        await docfxBuild(docfxProjectDir, themeDir, logLevel);
    } catch (err) {
        // do nothing
    }
}

// Builds base dist then builds docfx site using just base dist. Serves pipelineable resources using webpack dev server.
async function serveDev() {
    // Set docfx project directory
    var docfxProjectDir = argv.d ? argv.d.trim() : '../examples/blog';
    if (!path.isAbsolute(docfxProjectDir)) {
        docfxProjectDir = path.join(__dirname, docfxProjectDir);
    }

    // Set theme directory
    var themeDir = path.join(__dirname, `../dist/theme`);

    // Set logging verbosity (use environment variable instead?)
    var logLevel = argv.l ? argv.l.trim() : null;

    // Initial build
    await tryBuild(docfxProjectDir, themeDir, logLevel);

    // Start watcher for serve build
    var watcher = chokidar.watch([
        path.join(__dirname, '../templates'),
        path.join(__dirname, '../plugins'),
        path.join(__dirname, '../fonts'),
        path.join(__dirname, '../misc'),
        path.join(docfxProjectDir, 'src'),
    ]);
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
                    await tryBuild(docfxProjectDir, themeDir, logLevel);
                    building = false;
                }

                // Manually trigger refresh https://github.com/webpack/webpack-dev-server/issues/166
                // TODO does not work after serveBuild fails once (even when subsequent serveBuilds succeed)
                server.sockWrite(server.sockets, 'ok');
            }
        });

        if (logLevel === 'debug') {
            console.log(`*** Watching these Files and Directories ***`);
            var watchedPaths = watcher.getWatched();
            Object.keys(watchedPaths).forEach((dir) => {
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
    config.resolve.modules.unshift(path.join(__dirname, "../node_modules"));
    const compiler = webpack(config);
    const server = new webpackDevServer(compiler,
        {
            contentBase: path.join(docfxProjectDir, '_site'),
            publicPath: '/styles/',
            compress: false,
            stats: logLevel === 'debug' ? 'verbose' : 'errors-only'
        });
    server.listen(8080, "127.0.0.1", function () {
        console.log("Starting server on http://localhost:8080");
    });
}

serveDev();