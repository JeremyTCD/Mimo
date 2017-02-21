const path = require('path');
const fs = require('fs-extra');

module.exports = function copyFiles() {
    const outputDir = path.join(__dirname, 'bin');

    fs.copySync(path.join(__dirname, 'fonts'), path.join(outputDir, 'fonts'));
    fs.copySync(path.join(__dirname, 'plugins'), path.join(outputDir, 'plugins'));
    fs.copySync(path.join(__dirname, 'templates'), outputDir);
    fs.copySync(path.join(__dirname, 'misc'), outputDir);
    fs.copySync(path.join(__dirname, 'docfx.js'), path.join(outputDir, 'common.js'));
};