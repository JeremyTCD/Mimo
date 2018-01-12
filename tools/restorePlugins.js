const exec = require('child_process').exec;
const path = require('path');

module.exports = function restorePlugins(debug) {
    return new Promise((resolve, reject) => {
        console.log(`start - restore plugins`);

        var childProcess = exec('msbuild', { cwd: __dirname }, (err, stdout, stderr) => {
            if (err) {
                console.log(stdout);
                reject();
            } else {
                if (debug) {
                    console.log(stdout);
                }
                console.log(`complete - restore plugins`);

                resolve();
            }
        });
    });
};