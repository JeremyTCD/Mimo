const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const chokidar = require('chokidar');
const docfxBuild = require('./docfxBuild');
const browserSync = require('browser-sync').create();

async function serve() {
    // Get docfx project directory
    var docfxProjectDir = path.join(__dirname, '../../../..');

    // Set logging verbosity (use environment variable instead?)
    var logLevel = argv.l ? argv.l.trim() : null;

    // Run serve build once
    await docfxBuild(docfxProjectDir, null, logLevel);

    // Start watcher for serve build
    var watcher = chokidar.watch([path.join(docfxProjectDir, 'src'), path.join(docfxProjectDir, 'docfx.json')]);
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
                    try {
                        await docfxBuild(docfxProjectDir, null, logLevel);
                    }
                    catch (err){
                        // Do nothing. docfxBuild prints stdout from running docfx.
                    }
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
    browserSync.init({
        server: path.join(docfxProjectDir, '_site'),
        ui: false
    });
}

serve();