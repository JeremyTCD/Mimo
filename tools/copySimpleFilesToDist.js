const path = require('path');
const cpy = require('cpy');

module.exports = function copySimpleFilesTodist() {
    const outputDir = path.join(__dirname, '../dist');

    return Promise.all([cpy(path.join(__dirname, '../fonts/*'), path.join(outputDir, 'fonts')),
    cpy(path.join(__dirname, '../plugins/*'), path.join(outputDir, 'plugins')),
    cpy(path.join(__dirname, '../templates/*'), outputDir, {nodir: true}), // Attempting to copy a dir causes errors
    cpy(path.join(__dirname, '../templates/partials/*'), path.join(outputDir, 'partials')),
    cpy(path.join(__dirname, '../misc/*'), outputDir)]);
};