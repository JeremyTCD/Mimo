const exec = require('child_process').exec;
const path = require('path');

module.exports = function restorePlugins() {
    return new Promise((resolve, reject) => {
        var childProcess = exec('msbuild', { cwd: __dirname }, (err, stdout, stderr) => {
            console.log(stdout);
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