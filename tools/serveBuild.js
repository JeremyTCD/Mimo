const copySimpleFilesToDist = require(`./copySimpleFilesToDist`);
const restorePlugins = require(`./restorePlugins`);
const clean = require(`./clean`);
const docfxBuild = require(`./docfxBuild`);

module.exports = async function serveBuild(docfxProjectDir, logLevel) {
    console.log(`*** start - serve build ***`);
    console.log(`start - clean`);
    await clean();
    console.log(`complete - clean`);

    console.log(`start - restore plugins`);
    await restorePlugins(logLevel);
    console.log(`complete - restore plugins`);

    console.log(`start - copy simple files`);
    await copySimpleFilesToDist();
    console.log(`complete - copy simple files`);

    console.log(`start - docfx build`);
    await docfxBuild(docfxProjectDir, logLevel);
    console.log(`complete - docfx build`);
    console.log(`*** complete - serve build ***`);
}