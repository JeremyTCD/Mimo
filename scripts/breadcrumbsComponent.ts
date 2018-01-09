import mediaService from './mediaService';
import transitionsService from './transitionsService';
import listItemService from './listItemService';
import Component from './component';

class BreadcrumbsComponent extends Component {
    breadcrumbs: ListItem[] = [];
    rootBreadcrumbLoaded: boolean = false;
    childBreadcrumbsLoaded: boolean = false;

    protected canInitialize(): boolean {
        return document.getElementById('breadcrumbs') ? true : false;
    }

    protected setup(): void {
        this.setupBreadcrumbs();
    }

    protected registerListeners(): void {
        let tocButton: HTMLElement = document.getElementById('toc-button');
        let leftMenu: HTMLElement = document.getElementById('left-menu');

        tocButton.addEventListener('click', (event: Event) => {
            transitionsService.toggleHeightWithTransition(leftMenu, tocButton);
        });

        window.addEventListener('resize', (event: Event) => {
            if (mediaService.mediaWidthNarrow()) {
                transitionsService.contractHeightWithoutTransition(leftMenu, tocButton);
            }
        });
    }

    private setupBreadcrumbs(): void {
        let html = listItemService.generateMultiLevelList(this.breadcrumbs,
            'breadcrumb',
            1);
        let breadcrumbFrag = document.createRange().createContextualFragment(html);

        let breadcrumbsContainer = document.querySelector('#breadcrumbs>.container');
        breadcrumbsContainer.insertBefore(breadcrumbFrag, breadcrumbsContainer.childNodes[0]);
    }

    public loadRootBreadCrumb(anchorElement: HTMLAnchorElement): void {
        if (!this.rootBreadcrumbLoaded) {
            this.breadcrumbs.unshift({
                href: anchorElement.href,
                innerHtml: anchorElement.innerHTML,
                items: null
            });

            this.rootBreadcrumbLoaded = true;
            if (this.childBreadcrumbsLoaded) {
                this.initialize();
            }
        }
    }

    public loadChildBreadcrumbs(anchorElements: HTMLAnchorElement[]): void {
        if (!this.childBreadcrumbsLoaded) {
            for (let i = anchorElements.length - 1; i >= 0; i--) {
                this.breadcrumbs.push({
                    href: anchorElements[i].href,
                    innerHtml: anchorElements[i].innerHTML,
                    items: null
                });
            }

            this.childBreadcrumbsLoaded = true;
            if (this.rootBreadcrumbLoaded) {
                this.initialize();
            }
        }
    }
}

export default new BreadcrumbsComponent();

