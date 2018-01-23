import pathService from './pathService';
import mediaService from './mediaService';
import transitionsService from './transitionsService';
import Component from './component';
import breadcrumbsComponent from './breadcrumbsComponent';
import searchResultsComponent from './searchResultsComponent';

class HeaderComponent extends Component {
    headerNavbarElement: HTMLElement;
    headerButtonElement: HTMLElement;
    navbarAndSearchWrapper: HTMLElement;
    headerSearchElement: HTMLElement;
    headerSearchInputElement: HTMLInputElement;
    headerSearchClearElement: HTMLElement;

    protected validDomElementExists(): boolean {
        // Header always exists
        return true;
    }

    protected setup(): void {
        this.headerSearchElement = document.getElementById('header-search') as HTMLElement;
        this.headerSearchInputElement = this.headerSearchElement.querySelector('input') as HTMLInputElement;
        this.headerSearchClearElement = this.headerSearchElement.querySelector('svg:last-child') as HTMLElement;
        this.headerNavbarElement = document.getElementById('header-navbar');
        this.headerButtonElement = document.getElementById('header-button');
        this.navbarAndSearchWrapper = document.querySelector('#header-navbar-and-search > .wrapper') as HTMLElement;

        this.setupNavbar();
    }

    protected registerListeners(): void {
        this.headerButtonElement.addEventListener('click', (event: Event) => {
            transitionsService.toggleHeightWithTransition(this.navbarAndSearchWrapper, this.headerButtonElement);

            if (!this.headerButtonElement.classList.contains('expanded')) {
                this.resetSearchInput();
            }
        });

        window.addEventListener('resize', (event: Event) => {
            // Going from wide/medium to narrow with text in search input
            if (this.headerSearchInputElement.value.length > 0 &&
                !this.headerButtonElement.classList.contains('expanded') &&
                mediaService.mediaWidthNarrow()) {
                transitionsService.expandHeightWithoutTransition(this.navbarAndSearchWrapper, this.headerButtonElement);
            }
        });

        this.headerSearchInputElement.addEventListener('focus', this.searchInputFocusListener);
        this.headerSearchInputElement.addEventListener('focusout', this.searchInputFocusOutListener);
        this.headerSearchInputElement.addEventListener('keyup', this.searchInputKeyUpListener);
        this.headerSearchClearElement.addEventListener('click', this.searchClearClickListener);
    }

    private resetSearchInput() {
        this.headerSearchInputElement.value = '';
        this.headerSearchClearElement.classList.remove('active');

        // This is exactly what search service calls when value is an empty string
        searchResultsComponent.setShown(false);
    }

    private searchClearClickListener = (event: Event) => {
        this.resetSearchInput();

        // Keep focus on search input so further searches can be made (no point placing focus on clear button)
        this.headerSearchInputElement.focus();
    }

    private searchInputKeyUpListener = (event: KeyboardEvent) => {
        // Edge returns Esc
        if (event.key === 'Escape' || event.key === 'Esc') {
            this.resetSearchInput();
            return;
        }

        if (this.headerSearchInputElement.value.length > 0) {
            this.headerSearchClearElement.classList.add('active');
        } else {
            this.headerSearchClearElement.classList.remove('active');
        }
    }

    private searchInputFocusListener = (event: Event) => {
        this.headerSearchElement.classList.add('active');
    }

    private searchInputFocusOutListener = (event: Event) => {
        // If there is still text, search results are still displayed, search input is still "active"
        if (this.headerSearchInputElement.value.length === 0) {
            this.headerSearchElement.classList.remove('active');
        }
    }

    private setupNavbar() {
        let navbarPath = document.querySelector("meta[property='docfx\\:navrel']").getAttribute('content');

        if (navbarPath) {
            navbarPath = navbarPath.replace(/\\/g, '/');
        }

        let getNavbarRequest = new XMLHttpRequest()
        getNavbarRequest.onreadystatechange = (event: Event) => {
            // TODO check status too
            if (getNavbarRequest.readyState === XMLHttpRequest.DONE) {
                let tocFrag = document.createRange().createContextualFragment(getNavbarRequest.responseText);
                this.headerNavbarElement.appendChild(tocFrag);

                this.setNavbarActiveTopic(navbarPath);
            }
        }
        getNavbarRequest.open('GET', navbarPath)
        getNavbarRequest.send()
    }

    private setNavbarActiveTopic(navbarPath: string): void {
        let tocPath = document.querySelector("meta[property='docfx\\:tocrel']").getAttribute('content');

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }
        let index = navbarPath.lastIndexOf('/');
        let navRel = '';
        if (index > -1) {
            navRel = navbarPath.substr(0, index + 1);
        }
        let currentAbsPath = pathService.getAbsolutePath(window.location.pathname);

        let navbarAnchorElements = this.headerNavbarElement.querySelectorAll('a[href]');

        for (let i = 0; i < navbarAnchorElements.length; i++) {
            let anchorElement = navbarAnchorElements[i] as HTMLAnchorElement;
            let href = anchorElement.getAttribute('href');

            if (pathService.isRelativePath(href)) {
                href = navRel + href;
                anchorElement.setAttribute('href', href);

                let isActive = false;
                let originalHref = anchorElement.name;
                if (originalHref) {
                    originalHref = navRel + originalHref;
                    if (pathService.getDirectory(pathService.getAbsolutePath(originalHref)) === pathService.getDirectory(pathService.getAbsolutePath(tocPath))) {
                        isActive = true;
                    }
                } else {
                    if (pathService.getAbsolutePath(href) === currentAbsPath) {
                        isActive = true;
                    }
                }
                if (isActive) {
                    anchorElement.parentElement.classList.add('active');
                    breadcrumbsComponent.loadRootBreadCrumb(anchorElement);
                } else {
                    anchorElement.parentElement.classList.remove('active')
                }
            }
        }
    }
}

export default new HeaderComponent();