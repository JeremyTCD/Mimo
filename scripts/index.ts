import "../styles/index.scss";

import articleComponent from './articleComponent';
import headerComponent from './headerComponent';
import salComponent from './salComponent';
import leftMenuComponent from './leftMenuComponent';
import footerComponent from './footerComponent';
import rightMenuComponent from './rightMenuComponent';

import searchService from './searchService';
import { openExternalLinksInNewTab } from './linkService';

$(function () {
    salComponent.initialize();
    headerComponent.initialize();
    leftMenuComponent.initialize();
    footerComponent.initialize();
    rightMenuComponent.initialize();
    articleComponent.initialize();

    searchService.setupSearch();
    openExternalLinksInNewTab();
})
