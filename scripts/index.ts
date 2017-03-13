import "../styles/index.scss";

import articleComponent from './articleComponent';
import headerComponent from './headerComponent';
import sortedArticleList from './sortedArticleList';
import searchBuilder from './search';
import leftMenuBuilder from './leftMenu';
import footerComponent from './footerComponent';
import rightMenuComponent from './rightMenuComponent';

import { openExternalLinksInNewTab } from './linkService';

$(function () {
    searchBuilder.build();
    sortedArticleList.build();
    headerComponent.initialize();
    leftMenuBuilder.build();
    footerComponent.initialize();
    rightMenuComponent.initialize();
    articleComponent.initialize();

    openExternalLinksInNewTab();
})
