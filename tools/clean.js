const rimraf = require('rimraf');

module.exports = function clean() {
    return new Promise((resolve, reject) => {
        rimraf('./dist', (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
};