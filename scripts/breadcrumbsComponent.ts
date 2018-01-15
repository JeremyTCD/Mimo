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
            if (!mediaService.mediaWidthNarrow()) {
                transitionsService.contractHeightWithoutTransition(leftMenu, tocButton);
            }
        });
    }

    private setupBreadcrumbs(): void {
        let ulElement = listItemService.generateMultiLevelList(this.breadcrumbs,
            'breadcrumb',
            1);

        let breadcrumbsContainer = document.querySelector('#breadcrumbs>.container');
        breadcrumbsContainer.insertBefore(ulElement, breadcrumbsContainer.childNodes[0]);
    }

    public loadRootBreadCrumb(anchorElement: HTMLAnchorElement): void {
        if (!this.rootBreadcrumbLoaded) {
            this.breadcrumbs.unshift({
                element: anchorElement.cloneNode(true) as HTMLElement,
                items: null
            });

            this.rootBreadcrumbLoaded = true;
            if (this.childBreadcrumbsLoaded) {
                this.initialize();
            }
        }
    }

    public loadChildBreadcrumbs(elements: HTMLElement[]): void {
        if (!this.childBreadcrumbsLoaded) {
            for (let i = elements.length - 1; i >= 0; i--) {
                let element = elements[i];
                let clone = element.cloneNode(true) as HTMLElement;

                clone.removeChild(clone.querySelector('svg'));

                this.breadcrumbs.push({
                    element: clone,
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

