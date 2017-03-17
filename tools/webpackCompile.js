const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = function webpackCompile() {
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            console.log(stats);
            if (err) {
                console.log(err);
                reject();
            } else {
                resolve();
            }
        });
    });
};