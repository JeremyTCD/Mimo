const copySimpleFilesToBin = require('./copySimpleFilesToBin');
const restorePlugins = require('./restorePlugins');
const webpackCompile = require('./webpackCompile');
const clean = require('./clean');

async function build() {
    console.log('*** start - clean ***');
    await clean();
    console.log('*** complete - clean ***');

    console.log('*** start - restore plugins ***');
    await restorePlugins();
    console.log('*** complete - restore plugins ***');

    console.log('*** start - copy simple files ***');
    await copySimpleFilesToBin();
    console.log('*** complete - copy simple files ***');

    console.log('*** start - webpack compile ***');
    await webpackCompile();
    console.log('*** complete - webpack compile ***');

}

build();