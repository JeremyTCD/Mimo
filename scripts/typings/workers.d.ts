// Based on https://github.com/webpack-contrib/worker-loader/issues/94
// Declaring an ambient module with name 'worker-loader!*' allows for imports in the form worker-loader!* - https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#wildcard-character-in-module-names
declare module 'worker-loader?*' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export = WebpackWorker;
}