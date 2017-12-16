const copySimpleFilesToDist = require('./copySimpleFilesToDist');
const restorePlugins = require('./restorePlugins');
const webpackCompile = require('./webpackCompile');
const cleanDist = require('./cleanDist');
const buildBaseDist = require('./buildBaseDist');
const argv = require('minimist')(process.argv.slice(2));

async function buildDist() {
    // Set logging verbosity
    var logLevel = argv.l ? argv.l.trim() : null;

    console.log(`*** start - build dist ***`);
    await cleanDist();
    await buildBaseDist(logLevel);
    await webpackCompile(logLevel);
    console.log(`*** complete - build dist ***`);
}

buildDist();