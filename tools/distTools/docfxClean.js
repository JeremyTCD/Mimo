const rimraf = require('rimraf');
const path = require('path');

module.exports = function docfxClean(docfxProjectDir) {
    return new Promise((resolve, reject) => {
        rimraf(path.join(docfxProjectDir, './_site'), (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
};