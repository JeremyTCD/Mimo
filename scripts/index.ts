import '../styles/index.scss';

// TODO use commonjs style since tsc removes es6 style imports, e.g "import logo from './logo.svg'". This shouldn't 
// be the case.
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
require('../resources/ion-icons-social-github.svg');
require('../resources/ion-icons-social-twitter.svg');
require('../resources/ion-icons-social-instagram.svg');
require('../resources/ion-icons-social-facebook.svg');
require('../resources/ion-icons-social-googleplus.svg');


import articleComponent from './articleComponent';
import headerComponent from './headerComponent';
import salComponent from './salComponent';
import leftMenuComponent from './leftMenuComponent';
import footerComponent from './footerComponent';
import rightMenuComponent from './rightMenuComponent';
import commentsComponent from './commentsComponent';

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

    searchService.setupSearch();
    linkService.setupOpenExternalLinksInNewTab();
    linkService.setupSmoothScroll();
})
