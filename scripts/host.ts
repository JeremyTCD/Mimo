declare var STYLES_CUSTOM_INDEX: string;

// TODO should import scss constants first, then allow custom scss to customize constants, then import the rest of the scss
if (STYLES_CUSTOM_INDEX) {
    require(STYLES_CUSTOM_INDEX);
}

import '../styles/index.scss';

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

// Global imports
import 'jquery';
import 'intersection-observer';

// Host
import { Container } from 'inversify';
import 'reflect-metadata';
import RootComponent from './shared/rootComponent';

import NavbarComponent from './pageHeader/navbarComponent';
import PageHeaderComponent from './pageHeader/pageHeaderComponent';
import SearchComponent from './pageHeader/searchComponent';
import SearchResultsComponent from './pageHeader/searchResultsComponent';

import SectionMenuComponent from './sectionMenu/sectionMenuComponent';
import SectionMenuHeaderComponent from './sectionMenu/sectionMenuHeaderComponent';
import SectionPagesFilterComponent from './sectionMenu/sectionPagesFilterComponent';
import SectionPagesComponent from './sectionMenu/sectionPagesComponent';

import ArticleComponent from './article/articleComponent';

import CommentsComponent from './comments/commentsComponent';

import SortedArticleListComponent from './sortedArticleList/sortedArticleListComponent';

import ArticleMenuComponent from './articleMenu/articleMenuComponent';
import TableOfContentsComponent from './articleMenu/tableOfContentsComponent';
import ArticleLinksComponent from './articleMenu/articleLinksComponent';
import ArticleMenuHeaderComponent from './articleMenu/articleMenuHeaderComponent';

import FooterComponent from './footer/footerComponent';

import CodeService from './shared/codeService';
import DebounceService from './shared/debounceService';
import HtmlEncodeService from './shared/htmlEncodeService';
import MediaGlobalService from './shared/mediaGlobalService';
import OverlayService from './shared/overlayService';
import PaginationService from './shared/paginationService';
import PathService from './shared/pathService';
import SearchService from './shared/searchService';
import SvgService from './shared/svgService';
import TooltipService from './shared/tooltipService';
import HeightService from './shared/heightService';
import TreeService from './shared/treeService';
import TextInputFactory from './shared/textInputFactory';
import CollapsibleMenuFactory from './shared/collapsibleMenuFactory';
import StringService from './shared/stringService';
import EasingService from './shared/easingService';
import DropdownFactory from './shared/dropdownFactory';
import ArticleGlobalService from './shared/articleGlobalService';
import LinkGlobalService from './shared/linkGlobalService';
import GlobalService from './shared/globalService';
import FixesGlobalService from './shared/fixesGlobalService';

export default class Host {
    private _globalServices: GlobalService[];
    private _rootComponents: RootComponent[];
    private _container: Container;

    public constructor() {
        this._container = new Container();
        this.addDefault(this._container);
    }

    public getContainer(): Container {
        return this._container;
    }

    public run(): void {
        this._globalServices = this._container.getAll<GlobalService>('GlobalService');
        this._rootComponents = this._container.getAll<RootComponent>('RootComponent');

        for (let i = 0; i < this._globalServices.length; i++) {
            this._globalServices[i].setupImmediate();
        }

        for (let i = 0; i < this._rootComponents.length; i++) {
            this._rootComponents[i].setupImmediate();
        }

        if (document.readyState === 'interactive' || document.readyState === 'loaded') {
            this.onDomContentLoaded();
        } else {
            document.addEventListener('DomContentLoaded', this.onDomContentLoaded);
        }

        if (document.readyState === 'complete') {
            this.onLoad();
        } else {
            window.addEventListener('load', this.onLoad);
        }
    }

    // Called when document has been parsed but resources may not have been loaded
    private onDomContentLoaded = (): void => {
        for (let i = 0; i < this._globalServices.length; i++) {
            this._globalServices[i].setupOnDomContentLoaded();
        }

        for (let i = 0; i < this._rootComponents.length; i++) {
            let rootComponent = this._rootComponents[i];

            if (rootComponent.enabled()) {
                rootComponent.setupOnDomContentLoaded();
            }
        }
    }

    // Called after document has been parsed and all resources have been loaded.
    // Logic that depends on dimensions of elements must be run here.
    private onLoad = (): void => {
        for (let i = 0; i < this._globalServices.length; i++) {
            this._globalServices[i].setupOnLoad();
        }

        for (let i = 0; i < this._rootComponents.length; i++) {
            let rootComponent = this._rootComponents[i];

            if (rootComponent.enabled()) {
                rootComponent.setupOnLoad();
            }
        }
    }

    private addDefault(container: Container): void {
        // Page header
        container.bind<RootComponent>('RootComponent').to(PageHeaderComponent).inSingletonScope();
        container.bind<NavbarComponent>(NavbarComponent).toSelf().inSingletonScope();
        container.bind<SearchComponent>(SearchComponent).toSelf().inSingletonScope();
        container.bind<SearchResultsComponent>(SearchResultsComponent).toSelf().inSingletonScope();

        // Section menu
        container.bind<RootComponent>('RootComponent').to(SectionMenuComponent).inSingletonScope();
        container.bind<SectionMenuHeaderComponent>(SectionMenuHeaderComponent).toSelf().inSingletonScope();
        container.bind<SectionPagesComponent>(SectionPagesComponent).toSelf().inSingletonScope();
        container.bind<SectionPagesFilterComponent>(SectionPagesFilterComponent).toSelf().inSingletonScope();

        // Article
        container.bind<RootComponent>('RootComponent').to(ArticleComponent).inSingletonScope();

        // Comments
        container.bind<RootComponent>('RootComponent').to(CommentsComponent).inSingletonScope();

        // Sorted article list
        container.bind<RootComponent>('RootComponent').to(SortedArticleListComponent).inSingletonScope();

        // Article menu
        container.bind<RootComponent>('RootComponent').to(ArticleMenuComponent).inSingletonScope();
        container.bind<TableOfContentsComponent>(TableOfContentsComponent).toSelf().inSingletonScope();
        container.bind<ArticleLinksComponent>(ArticleLinksComponent).toSelf().inSingletonScope();
        container.bind<ArticleMenuHeaderComponent>(ArticleMenuHeaderComponent).toSelf().inSingletonScope();

        // Footer
        container.bind<RootComponent>('RootComponent').to(FooterComponent).inSingletonScope();

        // Shared
        container.bind<GlobalService>('GlobalService').to(ArticleGlobalService).inSingletonScope().whenTargetNamed('ArticleGlobalService');
        container.bind<GlobalService>('GlobalService').to(LinkGlobalService).inSingletonScope().whenTargetNamed('LinkGlobalService');
        container.bind<GlobalService>('GlobalService').to(MediaGlobalService).inSingletonScope().whenTargetNamed('MediaGlobalService');
        container.bind<GlobalService>('GlobalService').to(FixesGlobalService).inSingletonScope().whenTargetNamed('FixesGlobalService');
        container.bind<CodeService>(CodeService).toSelf().inSingletonScope();
        container.bind<DebounceService>(DebounceService).toSelf().inSingletonScope();
        container.bind<HtmlEncodeService>(HtmlEncodeService).toSelf().inSingletonScope();
        container.bind<OverlayService>(OverlayService).toSelf().inSingletonScope();
        container.bind<PaginationService>(PaginationService).toSelf().inSingletonScope();
        container.bind<PathService>(PathService).toSelf().inSingletonScope();
        container.bind<SearchService>(SearchService).toSelf().inSingletonScope();
        container.bind<SvgService>(SvgService).toSelf().inSingletonScope();
        container.bind<TooltipService>(TooltipService).toSelf().inSingletonScope();
        container.bind<HeightService>(HeightService).toSelf().inSingletonScope();
        container.bind<TreeService>(TreeService).toSelf().inSingletonScope();
        container.bind<TextInputFactory>(TextInputFactory).toSelf().inSingletonScope();
        container.bind<CollapsibleMenuFactory>(CollapsibleMenuFactory).toSelf().inSingletonScope();
        container.bind<StringService>(StringService).toSelf().inSingletonScope();
        container.bind<EasingService>(EasingService).toSelf().inSingletonScope();
        container.bind<DropdownFactory>(DropdownFactory).toSelf().inSingletonScope();
    }
}