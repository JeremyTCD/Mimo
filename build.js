const copyFiles = require('./build.copy');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const rimraf = require('rimraf');

rimraf.sync('./bin');

copyFiles();

webpack(webpackConfig, (err, stats) => {
    if (err) {
        console.log(err);
        console.log(stats);
    }
});

  