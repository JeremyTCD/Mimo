const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = function webpackCompile(logLevel) {
    return new Promise((resolve, reject) => {
        console.log(`start - webpack compile`);

        webpack(webpackConfig(), (err, stats) => {
            if (err) {
                console.log(stats);
                console.log(err);
                reject();
            } else {
                if (logLevel === 'debug') {
                    console.log(stats);
                }
                console.log(`complete - webpack compile`);

                resolve();
            }
        });
    });
};