// These constants are defined by webpack's define plugin (see webpack.config.js)
if (SCRIPTS_CUSTOM_INDEX) {
    require(SCRIPTS_CUSTOM_INDEX);
}
// TODO should import scss constants first, then allow custom scss to customize constants, then import the rest of the scss
if (STYLES_CUSTOM_INDEX) {
    require(STYLES_CUSTOM_INDEX);
}

import '../styles/index.scss';
import container from './container';
import RootComponent from './shared/rootComponent';
import GlobalService from './shared/globalService';

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
import 'intersection-observer';

// TODO convert into a class with an entry method (main)
let rootComponents = container.getAll<RootComponent>('RootComponent');
let globalServices = container.getAll<GlobalService>('GlobalService');

// Called when document has been parsed but resources may not have been loaded
function onDomContentLoaded() {
    for (let i = 0; i < globalServices.length; i++) {
        globalServices[i].setupOnDomContentLoaded();
    }

    for (let i = 0; i < rootComponents.length; i++) {
        let rootComponent = rootComponents[i];

        if (rootComponent.enabled()) {
            rootComponent.setupOnDomContentLoaded();
        }
    }
}

// Called after document has been parsed and all resources have been loaded.
// Logic that depends on dimensions of elements must be run here.
function onLoad() {
    for (let i = 0; i < globalServices.length; i++) {
        globalServices[i].setupOnLoad();
    }

    for (let i = 0; i < rootComponents.length; i++) {
        let rootComponent = rootComponents[i];

        if (rootComponent.enabled()) {
            rootComponent.setupOnLoad();
        }
    }
}

for (let i = 0; i < globalServices.length; i++) {
    globalServices[i].setupImmediate();
}

for (let i = 0; i < rootComponents.length; i++) {
    rootComponents[i].setupImmediate();
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