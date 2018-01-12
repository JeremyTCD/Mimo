const copySimpleFilesToDist = require('./copySimpleFilesToDist');
const restorePlugins = require('./restorePlugins');
const clean = require('./clean');

// Builds base output folder (without files from webpack pipeline)
module.exports = async function buildBase(docfxProjectDir, debug) {
    console.log(`*** start - build base ***`);
    await clean(docfxProjectDir);
    await restorePlugins(debug);
    await copySimpleFilesToDist(docfxProjectDir);
    console.log(`*** complete - build base ***`);
}