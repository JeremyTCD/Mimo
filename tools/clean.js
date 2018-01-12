const rimraf = require('rimraf');
const path = require('path');

// Deletes bin
module.exports = function clean(docfxProjectDir) {
    return new Promise((resolve, reject) => {
        console.log(`start - clean`);

        rimraf(path.join(docfxProjectDir, './bin'), (err) => {
            if (err) {
                console.log(`${err.name}\n${err.message}\n${err.stack}`)
                reject();
            } else {
                console.log(`complete - clean`);
                resolve();
            }
        });
    });
};