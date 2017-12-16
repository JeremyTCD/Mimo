const rimraf = require('rimraf');
const path = require('path');

module.exports = function cleanDist() {
    return new Promise((resolve, reject) => {
        console.log(`start - clean dist`);

        rimraf(path.join(__dirname, '../dist'), (err) => {
            if (err) {
                console.log(`${err.name}\n${err.message}\n${err.stack}`)
                reject();
            } else {
                console.log(`complete - clean dist`);

                resolve();
            }
        });
    });
};