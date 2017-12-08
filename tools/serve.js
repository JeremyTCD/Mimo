const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const chokidar = require('chokidar');
const serveBuild = require('./serveBuild');

async function serve() {
    // Set environment
    const environment = process.env.NODE_ENV;
    const isProduction = environment === 'production';

    // Set docfx project directory
    var docfxProjectDir = argv.d ? argv.d.trim() : '../examples/blog';
    if (!path.isAbsolute(docfxProjectDir)) {
        docfxProjectDir = path.join(__dirname, docfxProjectDir);
    }

    // Set logging verbosity (use environment variable instead?)
    var logLevel = argv.l ? argv.l.trim() : null;

    // Run serve build once
    await serveBuild(docfxProjectDir, logLevel);

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
                    await serveBuild(docfxProjectDir, logLevel);
                    building = false;
                }
                // Manually trigger refresh https://github.com/webpack/webpack-dev-server/issues/166
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
    const webpackConfig = require('./webpack.config.js');
    webpackConfig.entry.bundle.unshift("webpack-dev-server/client?http://localhost:8080/");
    webpackConfig.resolve.modules.unshift(path.join(__dirname, "../node_modules"));
    const compiler = webpack(webpackConfig);
    const server = new webpackDevServer(compiler,
        {
            contentBase: path.join(docfxProjectDir, '_site'),
            publicPath: '/styles/',
            compress: isProduction,
            stats: logLevel === 'debug' ? 'verbose' : 'errors-only'
        });
    server.listen(8080, "127.0.0.1", function () {
        console.log("Starting server on http://localhost:8080");
    });
}

serve();