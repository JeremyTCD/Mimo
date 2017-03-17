const path = require('path');
const cpy = require('cpy');

module.exports = function copySimpleFilesToBin() {
    const outputDir = path.join(__dirname, '../bin');

    return Promise.all([cpy(path.join(__dirname, '../fonts/*.*'), path.join(outputDir, 'fonts')),
    cpy([path.join(__dirname, '../plugins/net452/*.*'), '!**/Microsoft.DocAsCode.*.dll'], path.join(outputDir, 'plugins')),
    cpy(path.join(__dirname, '../templates/*.*'), outputDir),
    cpy(path.join(__dirname, '../templates/partials/*.*'), path.join(outputDir, 'partials')),
    cpy(path.join(__dirname, '../misc/*.*'), outputDir)]);
};