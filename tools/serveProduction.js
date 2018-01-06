const path = require('path');
const compression = require('compression');
const argv = require('minimist')(process.argv.slice(2));
const chokidar = require('chokidar');
const buildBaseDist = require('./buildBaseDist.js');
const webpackCompile = require('./webpackCompile');
const docfxBuild = require('./docfxBuild');
const browserSync = require('browser-sync').create();
const fs = require('fs');

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
    var themeDir = `${path.join(__dirname, `../dist/theme`)},./src/customizations`;

    // Set logging verbosity (use environment variable instead?)
    var logLevel = argv.l ? argv.l.trim() : null;

    // Initial build
    await tryBuild(docfxProjectDir, themeDir, logLevel);

    // Note: If all of these directories are watched and one of them does not exist, chokidar fails silently - https://github.com/paulmillr/chokidar/issues/346
    var foldersToWatch = [docfxProjectDir,
        path.join(__dirname, '../templates'),
        path.join(__dirname, '../plugins'),
        path.join(__dirname, '../fonts'),
        path.join(__dirname, '../misc'),
        path.join(__dirname, '../scripts'),
        path.join(__dirname, '../styles')];

    for (var i = foldersToWatch.length - 1; i >= 0; i--) {
        if (!fs.existsSync(foldersToWatch[i])) {
            foldersToWatch.splice(i, 1);
        }
    }

    // Start watcher for serve build
    var watcher = chokidar.watch(
        foldersToWatch,
        {
            ignored: [path.join(docfxProjectDir, '_site'), path.join(docfxProjectDir, 'obj')]
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
                console.log(`Directory: ${dir}`);
                watchedPaths[dir].forEach((file) => {
                    console.log(`    File/Directory: ${file}`);
                });
            });
        }
    });

    // Start server
    console.log(`start - browsersync serve`);
    browserSync.init({
        server: {
            baseDir: path.join(docfxProjectDir, '_site'),
            middleware: [compression()]
        },
        ui: false
    });
}

serveProduction();