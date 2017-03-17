const rimraf = require('rimraf');

module.exports = function clean() {
    return new Promise((resolve, reject) => {
        rimraf('./bin', (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
};