const path = require('path');
const cpy = require('cpy');

module.exports = function copySimpleFilesToDist(debug) {
    console.log(`start - copy simple files`);

    const distDir = path.join(__dirname, '../../dist');

    if (debug) {
        console.log(`distDir: ${distDir}`);
    }

    return Promise.all([cpy(path.join(__dirname, '../../fonts/*'), path.join(distDir, 'fonts')),
    cpy(path.join(__dirname, '../../resources/*'), path.join(distDir, 'resources')), 
    cpy(path.join(__dirname, '../../scripts/*'), path.join(distDir, 'scripts'), { nodir: true }), // Attempting to copy a dir causes errors
    cpy(path.join(__dirname, '../../scripts/workers/*'), path.join(distDir, 'scripts/workers')),
    cpy(path.join(__dirname, '../../styles/*'), path.join(distDir, 'styles')),
    cpy(path.join(__dirname, '../../templates/*'), path.join(distDir, 'templates'), { nodir: true }), // Attempting to copy a dir causes errors
    cpy(path.join(__dirname, '../../templates/partials/*'), path.join(distDir, 'templates/partials')),
    cpy(path.join(__dirname, '../../tools/*'), path.join(distDir, 'tools'), { nodir: true }),
    cpy(path.join(__dirname, '../../typings/*'), path.join(distDir, 'typings'), { nodir: true }),
    cpy(path.join(__dirname, '../../tsconfig.json'), distDir),
    cpy(path.join(__dirname, '../../misc/*'), path.join(distDir, 'misc'))]).then(_ => {
        console.log(`complete - copy simple files`);
    });
};