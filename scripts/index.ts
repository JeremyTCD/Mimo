import '../styles/index.scss';

// TODO use commonjs style since tsc removes es6 style imports, e.g "import logo from './logo.svg'". This shouldn't 
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
require('../resources/ion-icons-logo-github.svg');
require('../resources/ion-icons-logo-twitter.svg');
require('../resources/ion-icons-logo-instagram.svg');
require('../resources/ion-icons-logo-facebook.svg');
require('../resources/ion-icons-logo-googleplus.svg');


import articleComponent from './articleComponent';
import headerComponent from './headerComponent';
import salComponent from './salComponent';
import leftMenuComponent from './leftMenuComponent';
import footerComponent from './footerComponent';
import rightMenuComponent from './rightMenuComponent';
import commentsComponent from './commentsComponent';
import searchResultsComponent from './searchResultsComponent';

import searchService from './searchService';
import linkService from './linkService';

import * as $ from 'jquery';

$(function () {
    salComponent.initialize();
    headerComponent.initialize();
    leftMenuComponent.initialize();
    footerComponent.initialize();
    rightMenuComponent.initialize();
    articleComponent.initialize();
    commentsComponent.initialize();
    searchResultsComponent.initialize();

    searchService.setupSearch();
    linkService.setupOpenExternalLinksInNewTab();
    linkService.setupSmoothScroll();
})

// These constants are defined by webpack's define plugin (see webpack.config.js)
if (SCRIPTS_CUSTOM_INDEX) {
    require(SCRIPTS_CUSTOM_INDEX);
}
if (STYLES_CUSTOM_INDEX) {
    require(STYLES_CUSTOM_INDEX);
}