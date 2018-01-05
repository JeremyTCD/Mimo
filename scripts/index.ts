import "../styles/index.scss";

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
