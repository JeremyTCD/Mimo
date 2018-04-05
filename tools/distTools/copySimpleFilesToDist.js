const path = require('path');
const fse = require('fs-extra');

module.exports = function copySimpleFilesToDist(debug) {
    console.log(`start - copy simple files`);

    const root = path.join(__dirname, '../..');
    const distDir = path.join(root, 'dist');

    if (debug) {
        console.log(`distDir: ${distDir}`);
    }

    let include = ['fonts', 'resources', 'scripts', 'styles', 'templates', 'tools', 'typings', 'misc', 'tsconfig.json'];
    // TODO ignore sass cache folder
    let ignore = ['obj', 'distTools'];
    let promises = [];
    let filter = (src, dest) => {
        if (ignore.indexOf(path.basename(src)) !== -1) {
            return false;
        }
        return true;
    }
    let options = { filter: filter };

    for (let i = 0; i < include.length; i++) {
        let src = path.join(root, include[i]);

        if (fse.existsSync(src)) {
            let dest = path.join(distDir, include[i]);
            promises.push(fse.copy(src, dest, options));
        }
    }

    return Promise.all(promises).then(_ => { console.log(`complete - copy simple files`); });
};