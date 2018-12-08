const argv = require('minimist')(process.argv.slice(2));

const Parser = require('./parser');
const Builder = require('./builder');

// Builds base dist then builds docfx site using just base dist. Serves pipelineable resources using webpack dev server.
async function build() {
    // Set debug mode
    const debug = argv.d ? true : false;

    // Initialize parser
    var parser = new Parser(debug);

    // Set docfx project directory
    var docfxProjectDir = parser.getProjectDir();

    // Initialize builder
    var builder = new Builder(docfxProjectDir, debug);

    // Build
    await builder.buildFullBin();
}

build().catch(_ => process.exit(1));