import mediaService from './mediaService';
import transitionsService from './transitionsService';
import listItemService from './listItemService';
import Component from './component';
import * as SmoothScroll from 'smooth-scroll';

class BreadcrumbsComponent extends Component {
    breadcrumbsElement: HTMLElement = document.getElementById('breadcrumbs');
    breadcrumbs: ListItem[] = [];
    rootBreadcrumbLoaded: boolean = false;
    childBreadcrumbsLoaded: boolean = false;
    scrollToBreadcrumbs: SmoothScroll;
    lastScrollY: number;
    leftMenuWrapperElement: HTMLElement;
    leftMenuOverlayElement: HTMLElement;

    protected validDomElementExists(): boolean {
        return this.breadcrumbsElement ? true : false;
    }

    protected setupOnDomContentLoaded(): void {
        let ulElement = listItemService.generateMultiLevelList(this.breadcrumbs,
            'breadcrumb',
            1);

        let breadcrumbsContainer = document.querySelector('#breadcrumbs > .container');
        breadcrumbsContainer.insertBefore(ulElement, breadcrumbsContainer.childNodes[0]);
        this.scrollToBreadcrumbs = new SmoothScroll();
        this.leftMenuWrapperElement = document.getElementById('left-menu-wrapper');
        this.leftMenuOverlayElement = document.getElementById('left-menu-overlay');
        this.updateLeftMenu();
    }

    protected setupOnLoad(): void {
        // Do nothing
    }

    protected registerListeners(): void {
        let tocButtonElement: HTMLElement = document.getElementById('toc-button');

        tocButtonElement.addEventListener('click', (event: Event) => {
            transitionsService.toggleHeightWithTransition(this.leftMenuWrapperElement, tocButtonElement);

            if (tocButtonElement.classList.contains('expanded')) {
                this.lastScrollY = window.scrollY;
                this.scrollToBreadcrumbs.animateScroll(this.breadcrumbsElement, null, { speed: 400 });
                this.leftMenuOverlayElement.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                this.scrollToBreadcrumbs.animateScroll(this.lastScrollY, null, { speed: 400 });
                this.leftMenuOverlayElement.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        window.addEventListener('resize', (event: Event) => {
            if (mediaService.mediaWidthWide()) {
                transitionsService.contractHeightWithoutTransition(this.leftMenuWrapperElement, tocButtonElement);
                this.leftMenuOverlayElement.classList.remove('active');
                document.body.style.overflow = 'auto';
            } else {
                this.updateLeftMenu();
            }
        });
    }

    private updateLeftMenu = (): void => {
        if (!mediaService.mediaWidthWide()) {
            this.leftMenuWrapperElement.style.maxHeight = `${window.innerHeight - 37}px`;
        } else {
            this.leftMenuWrapperElement.style.maxHeight = 'initial';
        }
    }


    public loadRootBreadCrumb(anchorElement: HTMLAnchorElement): void {
        if (!this.validDomElementExists()) {
            return;
        }

        if (!this.rootBreadcrumbLoaded) {
            let clone = anchorElement.cloneNode(true) as HTMLElement;
            let wrapper: HTMLElement;

            clone.setAttribute('style', '');

            // Wrap anchors so animated underline works
            if (clone.tagName === 'A') {
                wrapper = document.createElement('span');
                wrapper.appendChild(clone);
            }

            this.breadcrumbs.unshift({
                element: wrapper || clone,
                items: null
            });

            this.rootBreadcrumbLoaded = true;
            if (this.childBreadcrumbsLoaded) {
                this.onDomContentLoaded();
            }
        }
    }

    public loadChildBreadcrumbs(elements: HTMLElement[]): void {
        if (!this.validDomElementExists()) {
            return;
        }

        if (!this.childBreadcrumbsLoaded) {
            for (let i = elements.length - 1; i >= 0; i--) {
                let element = elements[i];
                let clone = element.cloneNode(true) as HTMLElement;
                let wrapper: HTMLElement;

                clone.removeChild(clone.querySelector('svg'));
                clone.setAttribute('style', '');

                // Wrap anchors so animated underline works
                if (clone.tagName === 'A') {
                    wrapper = document.createElement('span');
                    wrapper.appendChild(clone);
                }

                this.breadcrumbs.push({
                    element: wrapper || clone,
                    items: null
                });
            }

            this.childBreadcrumbsLoaded = true;
            if (this.rootBreadcrumbLoaded) {
                this.onDomContentLoaded();
            }
        }
    }
}

export default new BreadcrumbsComponent();

