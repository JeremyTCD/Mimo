import { Container } from 'inversify';
import * as components from '../components';
import * as services from '../services';
import * as factories from '../factories';

export default class Host {
    private _globalServices: services.GlobalService[];
    private _rootComponents: components.RootComponent[];
    private _container: Container;

    public constructor() {
        this._container = new Container();
        this.addDefault(this._container);
    }

    public getContainer(): Container {
        return this._container;
    }

    public run(): void {
        this._globalServices = this._container.getAll<services.GlobalService>('GlobalService');
        this._rootComponents = this._container.getAll<components.RootComponent>('RootComponent');

        for (let i = 0; i < this._globalServices.length; i++) {
            this._globalServices[i].setupImmediate();
        }

        for (let i = 0; i < this._rootComponents.length; i++) {
            this._rootComponents[i].setupImmediate();
        }

        if (document.readyState === 'interactive' || document.readyState === 'complete') {
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
        container.bind<components.RootComponent>('RootComponent').to(components.PageHeaderComponent).inSingletonScope();
        container.bind<components.NavbarComponent>(components.NavbarComponent).toSelf().inSingletonScope();
        container.bind<components.SearchComponent>(components.SearchComponent).toSelf().inSingletonScope();
        container.bind<components.SearchResultsComponent>(components.SearchResultsComponent).toSelf().inSingletonScope();

        // Section menu
        container.bind<components.RootComponent>('RootComponent').to(components.CategoryMenuComponent).inSingletonScope();
        container.bind<components.CategoryMenuHeaderComponent>(components.CategoryMenuHeaderComponent).toSelf().inSingletonScope();
        container.bind<components.CategoryPagesComponent>(components.CategoryPagesComponent).toSelf().inSingletonScope();
        container.bind<components.CategoryPagesFilterComponent>(components.CategoryPagesFilterComponent).toSelf().inSingletonScope();

        // Article
        container.bind<components.RootComponent>('RootComponent').to(components.ArticleComponent).inSingletonScope();

        // Comments
        container.bind<components.RootComponent>('RootComponent').to(components.CommentsComponent).inSingletonScope();

        // Sorted article list
        container.bind<components.RootComponent>('RootComponent').to(components.SortedArticleListComponent).inSingletonScope();

        // Article menu
        container.bind<components.RootComponent>('RootComponent').to(components.ArticleMenuComponent).inSingletonScope();
        container.bind<components.OutlineComponent>(components.OutlineComponent).toSelf().inSingletonScope();
        container.bind<components.ArticleLinksComponent>(components.ArticleLinksComponent).toSelf().inSingletonScope();
        container.bind<components.ArticleMenuHeaderComponent>(components.ArticleMenuHeaderComponent).toSelf().inSingletonScope();

        // Footer
        container.bind<components.RootComponent>('RootComponent').to(components.PageFooterComponent).inSingletonScope();

        // Shared
        container.bind<services.GlobalService>('GlobalService').to(services.ArticleGlobalService).inSingletonScope().whenTargetNamed('ArticleGlobalService');
        container.bind<services.GlobalService>('GlobalService').to(services.LinkGlobalService).inSingletonScope().whenTargetNamed('LinkGlobalService');
        container.bind<services.GlobalService>('GlobalService').to(services.MediaGlobalService).inSingletonScope().whenTargetNamed('MediaGlobalService');
        container.bind<services.GlobalService>('GlobalService').to(services.FixesGlobalService).inSingletonScope().whenTargetNamed('FixesGlobalService');
        container.bind<services.CodeService>(services.CodeService).toSelf().inSingletonScope();
        container.bind<services.DebounceService>(services.DebounceService).toSelf().inSingletonScope();
        container.bind<services.HtmlEncodeService>(services.HtmlEncodeService).toSelf().inSingletonScope();
        container.bind<services.OverlayService>(services.OverlayService).toSelf().inSingletonScope();
        container.bind<services.PaginationService>(services.PaginationService).toSelf().inSingletonScope();
        container.bind<services.PathService>(services.PathService).toSelf().inSingletonScope();
        container.bind<services.SearchService>(services.SearchService).toSelf().inSingletonScope();
        container.bind<services.SvgService>(services.SvgService).toSelf().inSingletonScope();
        container.bind<services.TooltipService>(services.TooltipService).toSelf().inSingletonScope();
        container.bind<services.HeightService>(services.HeightService).toSelf().inSingletonScope();
        container.bind<services.TreeService>(services.TreeService).toSelf().inSingletonScope();
        container.bind<services.StringService>(services.StringService).toSelf().inSingletonScope();
        container.bind<services.EasingService>(services.EasingService).toSelf().inSingletonScope();
        container.bind<factories.TextInputFactory>(factories.TextInputFactory).toSelf().inSingletonScope();
        container.bind<factories.CollapsibleMenuFactory>(factories.CollapsibleMenuFactory).toSelf().inSingletonScope();
        container.bind<factories.DropdownFactory>(factories.DropdownFactory).toSelf().inSingletonScope();
    }
}