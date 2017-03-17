const copySimpleFilesToBin = require('./build.copy');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const rimraf = require('rimraf');

rimraf.sync('./bin');

copySimpleFilesToBin();

webpack(webpackConfig, (err, stats) => {
    if (err) {
        console.log(err);
        console.log(stats);
    }
});

  