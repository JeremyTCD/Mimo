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
            let rootComponent = this._rootComponents[i];

            if (rootComponent.enabled()) {
                this._rootComponents[i].setupRootImmediate();
            }
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
                rootComponent.setupRootOnDomContentLoaded();
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
                rootComponent.setupRootOnLoad();
            }
        }
    }

    private addDefault(container: Container): void {
        // Page header
        container.bind<components.RootComponent>('RootComponent').to(components.PageHeaderComponent).inSingletonScope();
        container.bind<components.SearchComponent>(components.SearchComponent).toSelf().inSingletonScope();

        // Category menu
        container.bind<components.RootComponent>('RootComponent').to(components.CategoryMenuComponent).inSingletonScope();

        // Main
        container.bind<components.RootComponent>('RootComponent').to(components.MainComponent).inSingletonScope();
        container.bind<components.MainArticleComponent>(components.MainArticleComponent).toSelf().inSingletonScope();
        container.bind<components.CommentsComponent>(components.CommentsComponent).toSelf().inSingletonScope();

        // Article menu
        container.bind<components.RootComponent>('RootComponent').to(components.ArticleMenuComponent).inSingletonScope();

        // Footer
        container.bind<components.RootComponent>('RootComponent').to(components.PageFooterComponent).inSingletonScope();

        // Shared
        container.bind<services.GlobalService>('GlobalService').to(services.ArticleGlobalService).inSingletonScope().whenTargetNamed('ArticleGlobalService');
        container.bind<services.GlobalService>('GlobalService').to(services.MediaGlobalService).inSingletonScope().whenTargetNamed('MediaGlobalService');
        container.bind<services.CodeService>(services.CodeService).toSelf().inSingletonScope();
        container.bind<services.DebounceService>(services.DebounceService).toSelf().inSingletonScope();
        container.bind<services.ThrottleService>(services.ThrottleService).toSelf().inSingletonScope();
        container.bind<services.HtmlEncodeService>(services.HtmlEncodeService).toSelf().inSingletonScope();
        container.bind<services.OverlayService>(services.OverlayService).toSelf().inSingletonScope();
        container.bind<services.TooltipService>(services.TooltipService).toSelf().inSingletonScope();
        container.bind<services.HeightService>(services.HeightService).toSelf().inSingletonScope();
        container.bind<services.StringService>(services.StringService).toSelf().inSingletonScope();
        container.bind<services.EasingService>(services.EasingService).toSelf().inSingletonScope();
        container.bind<factories.TextInputFactory>(factories.TextInputFactory).toSelf().inSingletonScope();
        container.bind<factories.CollapsibleMenuFactory>(factories.CollapsibleMenuFactory).toSelf().inSingletonScope();
        container.bind<factories.DropdownFactory>(factories.DropdownFactory).toSelf().inSingletonScope();
        container.bind<factories.OutlineFactory>(factories.OutlineFactory).toSelf().inSingletonScope();
        container.bind<factories.PaginationFactory>(factories.PaginationFactory).toSelf().inSingletonScope();
    }
} 