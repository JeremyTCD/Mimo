const path = require('path');
const fse = require('fs-extra');
const rimraf = require('rimraf');
const exec = require('child_process').exec;

class DistBuilder {
    constructor(debug) {
        this.debug = debug;
    }

    async compileTypescript() {
        console.log(`start - compile typescript`);

        let mainPromise = new Promise(async (resolve, reject) => {
            exec('"../../node_modules/.bin/tsc" -p "../../scripts/tsconfig.json"', { cwd: __dirname }, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    console.log(stdout);
                    reject();
                } else {
                    if (this.debug) {
                        console.log(stdout);
                    }
                    resolve();
                }
            });
        });

        // Workers have different native libraries available to them
        let workersPromise = new Promise(async (resolve, reject) => {
            exec('"../../node_modules/.bin/tsc" -p "../../scripts/workers/tsconfig.json"', { cwd: __dirname }, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    console.log(stdout);
                    reject();
                } else {
                    if (this.debug) {
                        console.log(stdout);
                    }
                    resolve();
                }
            });
        });

        return Promise.
            all([mainPromise, workersPromise]).
            then(_ => {
                console.log(`** complete - compile typescript**`)
            },
            _ => {
                console.log(`** incomplete - failed to compile typescript**`)
            });
    }

    async copySimpleFilesToDist() {
        console.log(`start - copy simple files`);

        const root = path.join(__dirname, '../..');
        const distDir = path.join(root, 'dist');

        if (this.debug) {
            console.log(`distDir: ${distDir}`);
        }

        let include = ['fonts', 'resources', 'styles', 'templates', 'tools', 'typings', 'misc'];
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

    async cleanDist() {
        return new Promise((resolve, reject) => {
            console.log(`start - clean dist`);

            rimraf(path.join(__dirname, '../../dist'), (err) => {
                if (err) {
                    console.log(`${err.name}\n${err.message}\n${err.stack}`)
                    reject();
                } else {
                    console.log(`complete - clean dist`);
                    resolve();
                }
            });
        });
    };
}

module.exports = DistBuilder;