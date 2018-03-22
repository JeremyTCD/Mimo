const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const rimraf = require('rimraf');
const cpy = require('cpy');
const webpackConfig = require('./webpack.config.js');
const webpack = require('webpack');

class Builder {
    constructor(docfxProjectDir, nodeModulesDir, debug) {
        this.nodeModulesDir = nodeModulesDir;
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

    // Builds theme,  excluding styles and scripts
    async buildBasicTheme() {
        console.log(`** start - build basic theme **`);
        await this.restorePlugins();
        await this.copySimpleFilesToTheme();
        console.log(`** complete - build basic theme **`);
    }

    // Builds site from theme and site source (md files, projects etc)
    async buildSite() {
        return new Promise(async (resolve, reject) => {
            console.log(`** start - build site **`);

            var themeDir = path.join(this.docfxProjectDir, './bin/theme');
            var overrideThemeDir = path.join(this.docfxProjectDir, './src/customizations/overrideTheme');
            var themeOption = `-t "${themeDir},${overrideThemeDir}"`;
            var siteContainingDir = path.join(this.docfxProjectDir, './bin/_site');
            var outputOption = `-o "${siteContainingDir}"`;

            if (this.debug) {
                console.log(`Executing: docfx build ${themeOption} ${outputOption}`);
            }

            exec(`docfx build ${themeOption} ${outputOption}`, { cwd: this.docfxProjectDir }, (err, stdout, stderr) => {
                if (err) {
                    console.log(stdout);
                    reject();
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
                    console.log(`${err.name}\n${err.message}\n${err.stack}`)
                    reject();
                } else {
                    console.log(`complete - clean bin`);
                    resolve();
                }
            });
        });
    };

    // Restores docfx plugins
    async restorePlugins() {
        return new Promise((resolve, reject) => {
            console.log(`start - restore plugins`);

            var childProcess = exec('msbuild', { cwd: __dirname }, (err, stdout, stderr) => {
                if (err) {
                    console.log(stdout);
                    reject();
                } else {
                    if (this.debug) {
                        console.log(stdout);
                    }
                    console.log(`complete - restore plugins`);

                    resolve();
                }
            });
        });
    };

    // Copies webpack output from theme to site
    async copyStylesFromThemeToSite() {
        console.log(`start - copy styles from theme to site`);

        const themeDir = path.join(this.docfxProjectDir, './bin/theme');
        const siteDir = path.join(this.docfxProjectDir, './bin/_site');

        return Promise.all([cpy(path.join(themeDir, 'styles/*'), path.join(siteDir, 'styles'))]).
            then(_ => {
                console.log(`complete - copy styles from theme to site`);
            });
    }

    // Copies files that do not have to be processed by webpack into theme
    async copySimpleFilesToTheme() {
        console.log(`start - copy simple files`);

        const themeDir = path.join(this.docfxProjectDir, './bin/theme');

        return Promise.all([
            cpy(path.join(__dirname, '../plugins/*'), path.join(themeDir, 'plugins')),
            cpy(path.join(__dirname, '../templates/*'), themeDir, { nodir: true }), // Attempting to copy a dir causes errors
            cpy(path.join(__dirname, '../templates/partials/**/*'), path.join(themeDir, 'partials'), { nodir: true }),
            cpy(path.join(__dirname, '../misc/*'), themeDir)
        ]).then(_ => {
            console.log(`complete - copy simple files`);
        });
    };

    async webpackCompile() {
        return new Promise((resolve, reject) => {
            console.log(`start - webpack compile`);

            webpack(webpackConfig(this.docfxProjectDir, this.nodeModulesDir), (err, stats) => {
                if (err) {
                    console.log(stats);
                    console.log(err);
                    reject();
                } else {
                    if (this.debug) {
                        console.log(stats);
                    }
                    console.log(`complete - webpack compile`);

                    resolve();
                }
            });
        });
    };
}

module.exports = Builder;