const path = require('path');
const cpy = require('cpy');

module.exports = function copySimpleFilesTodist() {
    const themeDir = path.join(__dirname, '../dist/theme');
    const toolsDir = path.join(__dirname, '../dist/tools');

    return Promise.all([cpy(path.join(__dirname, '../fonts/*'), path.join(themeDir, 'fonts')),
    cpy(path.join(__dirname, '../plugins/*'), path.join(themeDir, 'plugins')),
    cpy(path.join(__dirname, '../templates/*'), themeDir, {nodir: true}), // Attempting to copy a dir causes errors
    cpy(path.join(__dirname, '../templates/partials/*'), path.join(themeDir, 'partials')),
    cpy(path.join(__dirname, '../misc/*'), themeDir),
    cpy(path.join(__dirname, '../styles/*.css'), path.join(themeDir, 'styles')),
    cpy(path.join(__dirname, '../tools/distTools/*'), toolsDir),
    cpy(path.join(__dirname, '../tools/docfxClean.js'), toolsDir),
    cpy(path.join(__dirname, '../tools/docfxBuild.js'), toolsDir)]).then(_ => {
        console.log(`complete - copy simple files`);
    });
};