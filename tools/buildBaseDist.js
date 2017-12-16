const copySimpleFilesToDist = require('./copySimpleFilesToDist');
const restorePlugins = require('./restorePlugins');
const cleanDist = require('./cleanDist');

// Builds base dist folder (without files from webpack pipeline)
module.exports = async function buildBaseDist(logLevel) {
    console.log(`*** start - build base dist ***`);
    await cleanDist();
    await restorePlugins(logLevel);
    await copySimpleFilesToDist();
    console.log(`*** complete - build base dist ***`);
}