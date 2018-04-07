const path = require('path');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

class Parser {
    constructor(debug) {
        this.debug = debug;
    }

    getProjectDir() {
        var raw = argv.p;

        if (!raw) {
            throw "Docfx project directory must be specified";
        }
        var docfxProjectDir = raw.trim();
        if (!path.isAbsolute(docfxProjectDir)) {
            docfxProjectDir = path.join(__dirname, docfxProjectDir);
        }
        if (!fs.existsSync(docfxProjectDir)) {
            throw `Docfx project directory ${docfxProjectDir} does not exist`;
        }
        if (this.debug) {
            console.log(`serve: Docfx project directory set to ${docfxProjectDir}`);
        }

        return docfxProjectDir;
    }
}

module.exports =  Parser;