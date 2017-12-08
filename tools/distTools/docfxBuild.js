const exec = require('child_process').exec;
const path = require('path');
const docfxClean = require('./docfxClean');

module.exports = function docfxBuild(docfxProjectDir, logLevel) {
    return new Promise(async (resolve, reject) => {
        await docfxClean(docfxProjectDir);

        if (logLevel === 'debug') {
            console.log(`docfx build`);
        }
        exec(`docfx build`, { cwd: docfxProjectDir }, (err, stdout, stderr) => {
            if (logLevel === 'debug') {
                console.log(stdout);
            }
            if (err) {
                console.log(err);
                console.log(stderr);
                reject();
            } else {
                resolve();
            }
        });
    });
};