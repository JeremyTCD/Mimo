const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const chokidar = require('chokidar');
const buildBaseDist = require('./buildBaseDist.js');
const webpackCompile = require('./webpackCompile');
const docfxBuild = require('./docfxBuild');
const browserSync = require('browser-sync').create();

async function tryBuild(docfxProjectDir, themeDir, logLevel) {
    try {
        await buildBaseDist(logLevel);
        await webpackCompile();
        await docfxBuild(docfxProjectDir, themeDir, logLevel);
    } catch (err) {
        // do nothing
    }
}

// Builds and serves full dist. Necessary since in production mode every change to pipelineable resources causes hashes to change,
// necessitating a subsequent docfx build.
async function serveProduction() {
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
        path.join(__dirname, '../scripts'),
        path.join(__dirname, '../styles'),
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
                browserSync.reload();
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

    // Start server
    console.log(`start - browsersync serve`);
    browserSync.init({
        server: path.join(docfxProjectDir, '_site'),
        ui: false
    });
}

serveProduction();