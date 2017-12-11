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
            if (err) {
                console.log(stdout);
                reject();
            } else {
                if (logLevel === 'debug') {
                    console.log(stdout);
                }
                console.log(`complete - docfx build`);
                resolve();
            }
        });
    });
};