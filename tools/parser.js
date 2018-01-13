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

    getNodeDir() {
        var raw = argv.n;

        if (!raw) {
            throw "node_modules directory must be specified";
        }
        var nodeModulesDir = raw.trim();
        if (!path.isAbsolute(nodeModulesDir)) {
            nodeModulesDir = path.join(__dirname, nodeModulesDir);
        }
        if (!fs.existsSync(nodeModulesDir)) {
            throw `node_modules directory ${nodeModulesDir} does not exist`;
        }
        if (this.debug) {
            console.log(`serve: node_modules directory set to ${nodeModulesDir}`);
        }

        return nodeModulesDir;
    }
}

module.exports =  Parser;