const copySimpleFilesToDist = require('./copySimpleFilesToDist');
const restorePlugins = require('./restorePlugins');
const webpackCompile = require('./webpackCompile');
const clean = require('./clean');
const buildBase = require('./buildBase');
const argv = require('minimist')(process.argv.slice(2));

async function buildDist() {
    // Set logging verbosity
    var logLevel = argv.l ? argv.l.trim() : null;

    console.log(`*** start - build dist ***`);
    await clean();
    await buildBase(logLevel);
    await webpackCompile(logLevel);
    console.log(`*** complete - build dist ***`);
}

buildDist();