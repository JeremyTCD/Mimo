const DistBuilder = require('./distBuilder');
const argv = require('minimist')(process.argv.slice(2));

async function buildDist() {
    // Set logging verbosity
    var debug = argv.d ? true : false;
    var distBuilder = new DistBuilder();

    console.log(`*** start - build dist ***`);
    await distBuilder.cleanDist();
    await distBuilder.compileTypescript();
    await distBuilder.copySimpleFilesToDist();
    console.log(`*** complete - build dist ***`);
}

buildDist();