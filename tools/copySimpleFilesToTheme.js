const path = require('path');
const cpy = require('cpy');

module.exports = function copySimpleFilesToTheme(docfxProjectDir) {
    console.log(`start - copy simple files`);

    const themeDir = path.join(docfxProjectDir, './bin/theme');

    return Promise.all([cpy(path.join(__dirname, '../fonts/*'), path.join(themeDir, 'fonts')),
    cpy(path.join(__dirname, '../plugins/*'), path.join(themeDir, 'plugins')),
    cpy(path.join(__dirname, '../templates/*'), themeDir, { nodir: true }), // Attempting to copy a dir causes errors
    cpy(path.join(__dirname, '../templates/partials/*'), path.join(themeDir, 'partials')),
    cpy(path.join(__dirname, '../misc/*'), themeDir)]).then(_ => {
        console.log(`complete - copy simple files`);
    });
};