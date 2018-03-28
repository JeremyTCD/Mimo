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

import CodeService from './shared/codeService';
import DebounceService from './shared/debounceService';
import HtmlEncodeService from './shared/htmlEncodeService';
import MediaService from './shared/mediaService';
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

let container = new Container();

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

// Shared
container.bind<GlobalService>('GlobalService').to(ArticleGlobalService).inSingletonScope().whenTargetNamed('ArticleGlobalService');
container.bind<GlobalService>('GlobalService').to(LinkGlobalService).inSingletonScope().whenTargetNamed('LinkGlobalService');
container.bind<CodeService>(CodeService).toSelf().inSingletonScope();
container.bind<DebounceService>(DebounceService).toSelf().inSingletonScope();
container.bind<HtmlEncodeService>(HtmlEncodeService).toSelf().inSingletonScope();
container.bind<MediaService>(MediaService).toSelf().inSingletonScope();
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


export default container;