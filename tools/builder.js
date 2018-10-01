const path = require('path');
const exec = require('child_process').exec;
const rimraf = require('rimraf');
const fse = require('fs-extra');
const webpackConfig = require('./webpack.config.js');
const webpack = require('webpack');

class Builder {
    constructor(docfxProjectDir, debug) {
        this.docfxProjectDir = docfxProjectDir;
        this.debug = debug;
    }

    // Builds theme and site, including styles and scripts
    async buildFullBin() {
        console.log(`*** start - build full bin ***`);
        await this.cleanBin();
        await this.buildBasicBin();
        await this.webpackCompile();
        await this.copyStylesFromThemeToSite();
        console.log(`*** complete - build full bin ***`);
    }

    // Builds theme and site, excluding styles and scripts
    async buildBasicBin() {
        console.log(`*** start - build basic bin ***`);
        await this.buildBasicTheme();
        await this.buildSite();
        console.log(`*** complete - build basic bin ***`);
    }

    // Builds theme,excluding styles and scripts
    async buildBasicTheme() {
        console.log(`** start - build basic theme **`);
        await this.restorePlugins();
        this.copySimpleFilesToTheme();
        console.log(`** complete - build basic theme **`);
    }

    // Builds site from theme and site source (md files, projects etc)
    async buildSite() {
        return new Promise(async (resolve, reject) => {
            console.log(`** start - build site **`);

            var themeDir = path.join(this.docfxProjectDir, './bin/theme');
            var overrideThemeDir = path.join(this.docfxProjectDir, './src/overrideTheme');
            var themeOption = `-t "${themeDir},${overrideThemeDir}"`;
            var siteContainingDir = path.join(this.docfxProjectDir, './bin/_site');
            var outputOption = `-o "${siteContainingDir}"`;

            if (this.debug) {
                console.log(`Executing: docfx build ${themeOption} ${outputOption}`);
            }

            exec(`docfx build ${themeOption} ${outputOption}`, { cwd: this.docfxProjectDir }, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    console.log(stdout);
                    reject(err);
                } else {
                    if (this.debug) {
                        console.log(stdout);
                    }
                    console.log(`** complete - build site **`);
                    resolve();
                }
            });
        });
    }

    // Deletes bin
    async cleanBin() {
        return new Promise((resolve, reject) => {
            console.log(`start - clean bin`);

            rimraf(path.join(this.docfxProjectDir, './bin'), (err) => {
                if (err) {
                    console.log(`${err.name}\n${err.message}\n${err.stack}`);
                    reject(err);
                } else {
                    console.log(`complete - clean bin`);
                    resolve();
                }
            });
        });
    }

    // Restores docfx plugins
    async restorePlugins() {
        return new Promise((resolve, reject) => {
            console.log(`start - restore plugins`);

            exec('dotnet msbuild', { cwd: __dirname }, (err, stdout, stderr) => {
                if (err) {
                    console.log(stdout);
                    console.log(stderr);
                    reject(err);
                } else {
                    if (this.debug) {
                        console.log(stdout);
                    }
                    console.log(`complete - restore plugins`);

                    resolve();
                }
            });
        });
    }

    // Copies webpack output from theme to site
    async copyStylesFromThemeToSite() {
        console.log(`start - copy styles from theme to site`);

        const themeDir = path.join(this.docfxProjectDir, './bin/theme');
        const siteDir = path.join(this.docfxProjectDir, './bin/_site');

        return Promise.all([fse.copy(path.join(themeDir, 'styles'), path.join(siteDir, 'styles'))]).
            then(_ => {
                console.log(`complete - copy styles from theme to site`);
            });
    }

    // Copies files that do not have to be processed by webpack into theme
    copySimpleFilesToTheme() {
        console.log(`start - copy simple files`);

        const root = path.join(__dirname, '..');
        const themeDir = path.join(this.docfxProjectDir, './bin/theme');

        let include = [['plugins', 'plugins'], ['templates', ''], ['misc', '']];

        for (let i = 0; i < include.length; i++) {
            let includeOptions = include[i];
            let src = path.join(root, includeOptions[0]);

            if (fse.existsSync(src)) {
                let dest = path.join(themeDir, includeOptions[1]);
                // Both the contents of templates and misc are copied to the same directory, executing them asynchronously
                // causes file system errors.
                fse.copySync(src, dest);
            }
        }

        console.log(`complete - copy simple files`);
    }

    async webpackCompile() {
        return new Promise((resolve, reject) => {
            console.log(`start - webpack compile`);

            webpack(webpackConfig(this.docfxProjectDir), (err, stats) => {
                if (err) {
                    console.log(stats);
                    console.log(err);
                    reject(err);
                } else {
                    if (this.debug) {
                        console.log(stats);
                    }
                    console.log(`complete - webpack compile`);

                    resolve();
                }
            });
        });
    }
}

module.exports = Builder;