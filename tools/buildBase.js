const copySimpleFilesToTheme = require('./copySimpleFilesToTheme');
const restorePlugins = require('./restorePlugins');
const cleanBin = require('./cleanBin');

// Builds base output folder (without files from webpack pipeline)
module.exports = async function buildBase(docfxProjectDir, debug) {
    console.log(`*** start - build base ***`);
    await cleanBin(docfxProjectDir);
    await restorePlugins(debug);
    await copySimpleFilesToTheme(docfxProjectDir);
    console.log(`*** complete - build base ***`);
}