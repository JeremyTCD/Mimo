import '../styles/index.scss';
import container from './container';
import RootComponent from './shared/rootComponent';

// TODO use commonjs style since tsc removes es6 style imports, e.g 'import logo from './logo.svg''. This shouldn't 
// be the case.
require('../resources/material-design-clear-black.svg');
require('../resources/material-design-search.svg');
require('../resources/material-design-filter.svg');
require('../resources/material-design-link.svg');
require('../resources/material-design-date.svg');
require('../resources/material-design-person.svg');
require('../resources/material-design-drop-down.svg');
require('../resources/material-design-arrow-upward.svg');
require('../resources/material-design-chevron-right.svg');
require('../resources/material-design-first-page.svg');
require('../resources/material-design-previous-page.svg');
require('../resources/material-design-next-page.svg');
require('../resources/material-design-last-page.svg');
require('../resources/material-design-mode-edit.svg');
require('../resources/material-design-copy.svg');
require('../resources/material-design-copyright.svg');
require('../resources/material-design-info.svg');
require('../resources/material-design-warning.svg');
require('../resources/material-design-share.svg');
require('../resources/ion-icons-logo-github.svg');
require('../resources/ion-icons-logo-twitter.svg');
require('../resources/ion-icons-logo-instagram.svg');
require('../resources/ion-icons-logo-facebook.svg');
require('../resources/ion-icons-logo-googleplus.svg');

import * as $ from 'jquery';

let rootComponents = container.getAll<RootComponent>('RootComponent');

for (let i = 0; i < rootComponents.length; i++) {
    let rootComponent = rootComponents[i];

    // Can't call enabled before setupImmediate since setupImmediate is the first oppurtunity to check if an element exists
    rootComponent.setupImmediate();
}

// Called when document has been parsed but resources may not have been loaded
function onDomContentLoaded() {
    for (let i = 0; i < rootComponents.length; i++) {
        let rootComponent = rootComponents[i];

        if (rootComponent.enabled()) {
            rootComponent.setupOnDomContentLoaded();
            rootComponent.registerListeners();
        }
    }
}

// Called after document has been parsed and all resources have been loaded.
// Logic that depends on dimensions of elements must be run here.
function onLoad() {
    for (let i = 0; i < rootComponents.length; i++) {
        let rootComponent = rootComponents[i];

        if (rootComponent.enabled()) {
            rootComponent.setupOnLoad();
        }
    }
}

if (document.readyState === 'interactive' || document.readyState === 'loaded') {
    onDomContentLoaded();
} else {
    document.addEventListener('DomContentLoaded', onDomContentLoaded);
}

if (document.readyState === 'complete') {
    onLoad();
} else {
    window.addEventListener('load', onLoad);
}

// These constants are defined by webpack's define plugin (see webpack.config.js)
if (SCRIPTS_CUSTOM_INDEX) {
    require(SCRIPTS_CUSTOM_INDEX);
}
if (STYLES_CUSTOM_INDEX) {
    require(STYLES_CUSTOM_INDEX);
}