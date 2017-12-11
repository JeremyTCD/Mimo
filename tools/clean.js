const rimraf = require('rimraf');

module.exports = function clean() {
    return new Promise((resolve, reject) => {
        console.log(`start - clean`);

        rimraf('./dist', (err) => {
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