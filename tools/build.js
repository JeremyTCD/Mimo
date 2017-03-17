const copySimpleFilesToBin = require('./copySimpleFilesToBin');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const rimraf = require('rimraf');
const execSync = require('child_process').execSync;
const path = require('path');

rimraf.sync('./bin');

execSync('msbuild', { stdio: [0, 1, 2] });

copySimpleFilesToBin();

webpack(webpackConfig, (err, stats) => {
    if (err) {
        console.log(err);
        console.log(stats);
    }
});

  