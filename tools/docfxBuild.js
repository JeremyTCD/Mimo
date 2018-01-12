const exec = require('child_process').exec;
const path = require('path');

module.exports = function docfxBuild(docfxProjectDir, debug) {
    return new Promise(async (resolve, reject) => {
        console.log(`start - docfx build`);

        var themeDir = path.join(docfxProjectDir, './bin/theme');
        var themeOption = `-t "${themeDir}"`;
        var siteContainingDir = path.join(docfxProjectDir, './bin');
        var outputOption = `-o "${siteContainingDir}"`;

        if (debug) {
            console.log(`Executing: docfx build ${themeOption} ${outputOption}`);
        }

        exec(`docfx build ${themeOption} ${outputOption}`, { cwd: docfxProjectDir }, (err, stdout, stderr) => {
            if (err) {
                console.log(stdout);
                reject();
            } else {
                if (debug) {
                    console.log(stdout);
                }
                console.log(`complete - docfx build`);
                resolve();
            }
        });
    });
};