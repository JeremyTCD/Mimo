import "../styles/index.scss";

import articleComponent from './articleComponent';
import headerComponent from './headerComponent';
import salComponent from './salComponent';
import leftMenuComponent from './leftMenuComponent';
import footerComponent from './footerComponent';
import rightMenuComponent from './rightMenuComponent';

import searchBuilder from './searchService';
import { openExternalLinksInNewTab } from './linkService';

$(function () {
    searchBuilder.build();
    salComponent.initialize();
    headerComponent.initialize();
    leftMenuComponent.initialize();
    footerComponent.initialize();
    rightMenuComponent.initialize();
    articleComponent.initialize();

    openExternalLinksInNewTab();
})
