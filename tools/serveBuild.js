const copySimpleFilesToDist = require(`./copySimpleFilesToDist`);
const restorePlugins = require(`./restorePlugins`);
const clean = require(`./clean`);
const docfxBuild = require(`./docfxBuild`);

module.exports = async function serveBuild(docfxProjectDir, logLevel) {
    console.log(`*** start - serve build ***`);

    try {
        await clean();
        await restorePlugins(logLevel);
        await copySimpleFilesToDist();
        await docfxBuild(docfxProjectDir, logLevel);

        console.log(`*** complete - serve build ***`);
    }
    catch (error)
    {
        // Each promise should handle printing of its own errors then call reject with no arguments
        console.log(`***failed - serve build ***`);
    }
}