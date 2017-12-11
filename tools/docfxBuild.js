const exec = require('child_process').exec;
const path = require('path');
const docfxClean = require('./docfxClean');

module.exports = function docfxBuild(docfxProjectDir, themeDir, logLevel) {
    return new Promise(async (resolve, reject) => {
        console.log(`start - docfx build`);
        await docfxClean(docfxProjectDir);

        var themeOption = themeDir ? `-t "${themeDir}"` : ``;

        if (logLevel === 'debug') {
            console.log(`docfx build ${themeOption}`);
        }
        exec(`docfx build ${themeOption}`, { cwd: docfxProjectDir }, (err, stdout, stderr) => {
            if (logLevel === 'debug') {
                console.log(stdout);
            }
            if (err) {
                console.log(err);
                console.log(stderr);
                reject();
            } else {
                console.log(`complete - docfx build`);
                resolve();
            }
        });
    });
};