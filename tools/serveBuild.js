const copySimpleFilesToDist = require(`./copySimpleFilesToDist`);
const restorePlugins = require(`./restorePlugins`);
const clean = require(`./clean`);
const docfxBuild = require(`./docfxBuild`);
const path = require(`path`);

// Builds a partial dist folder for serving
module.exports = async function serveBuild(docfxProjectDir, logLevel) {
    console.log(`*** start - serve build ***`);

    try {
        await clean();
        await restorePlugins(logLevel);
        await copySimpleFilesToDist();
        await docfxBuild(docfxProjectDir, path.join(__dirname, `../dist/theme`), logLevel);

        console.log(`*** complete - serve build ***`);
    }
    catch (error)
    {
        // Each promise should handle printing of its own errors then call reject with no arguments
        console.log(`***failed - serve build ***`);
    }
}