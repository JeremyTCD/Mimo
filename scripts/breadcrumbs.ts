import {
    mediaWidthNarrow
} from './utils';
import {
    toggleHeightForTransition, contractHeightWithoutTransition,
} from './transitions';
import {
    generateMultiLevelList, ListItem
} from './listItem';
import Component from './component';

class Breadcrumbs extends Component {
    breadcrumbs: ListItem[] = [];
    rootBreadcrumbLoaded: boolean = false;
    childBreadcrumbsLoaded: boolean = false;

    protected canInitialize(): boolean {
        return true;
    }

    protected setup(): void {
        this.setupBreadcrumbs();
    }

    protected registerListeners(): void {
        $('#toc-button').on('click', (event: JQueryEventObject) => {
            toggleHeightForTransition($('#left-menu'), $(event.delegateTarget));
        });

        $(window).on('resize', (event: JQueryEventObject) => {
            if (mediaWidthNarrow()) {
                contractHeightWithoutTransition($('#left-menu'), $('#toc-button'));
            }
        });
    }

    private setupBreadcrumbs(): void {
        let html = generateMultiLevelList(this.breadcrumbs,
            'breadcrumb',
            1);
        $('#breadcrumbs>.container').prepend(html);
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

export default new Breadcrumbs();

