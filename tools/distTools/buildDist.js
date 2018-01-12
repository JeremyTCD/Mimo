const cleanDist = require('./cleanDist');
const copySimpleFilesToDist = require('./copySimpleFilesToDist');
const argv = require('minimist')(process.argv.slice(2));

async function buildDist() {
    // Set logging verbosity
    var debug = argv.d ? true : false;

    console.log(`*** start - build dist ***`);
    await cleanDist();
    await copySimpleFilesToDist(debug);
    console.log(`*** complete - build dist ***`);
}

buildDist();