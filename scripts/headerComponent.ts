import pathService from './pathService';
import mediaService from './mediaService';
import transitionsService from './transitionsService';
import Component from './component';
import breadcrumbsComponent from './breadcrumbsComponent';

class HeaderComponent extends Component {
    protected canInitialize(): boolean {
        return true;
    }

    protected setup(): void {
        this.setupNavbar();
        this.setupSearchInput();
    }

    protected registerListeners(): void {
        let wrapper = $('#header-navbar-and-search > .wrapper');
        document.getElementById('header-button').addEventListener('click', (event: Event) => {
            transitionsService.toggleHeightWithTransition(wrapper[0], wrapper[0]);
            (event.currentTarget as HTMLElement).classList.toggle('active');
        });

        window.addEventListener('resize', (event: Event) => {
            if (mediaService.mediaWidthNarrow()) {
                transitionsService.contractHeightWithoutTransition(wrapper[0], wrapper[0]);
                document.getElementById('header-button').classList.remove('active');
            }
        });
    }

    private setupSearchInput() {
        let headerSearchElement = document.getElementById('header-search');
        let headerSearchInputElement = headerSearchElement.querySelector('input');

        headerSearchInputElement.
            addEventListener('focus', (event: Event) => {
                headerSearchElement.classList.add('focus');
            });
        headerSearchInputElement.
            addEventListener('focusout', (event: Event) => {
                headerSearchElement.classList.remove('focus');
            });
    }

    private setupNavbar() {
        let navbarPath = $("meta[property='docfx\\:navrel']").attr("content");

        if (navbarPath) {
            navbarPath = navbarPath.replace(/\\/g, '/');
        }

        let getNavbarRequest = new XMLHttpRequest()
        getNavbarRequest.onreadystatechange = (event: Event) => {
            // TODO check status too
            if (getNavbarRequest.readyState === XMLHttpRequest.DONE) {
                let tocFrag = document.createRange().createContextualFragment(getNavbarRequest.responseText);
                document.getElementById('header-navbar').appendChild(tocFrag);

                this.setNavbarActiveTopic(navbarPath);
            }
        }
        getNavbarRequest.open('GET', navbarPath)
        getNavbarRequest.send()
    }

    private setNavbarActiveTopic(navbarPath: string): void {
        let tocPath = $("meta[property='docfx\\:tocrel']").attr("content");

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }
        let index = navbarPath.lastIndexOf('/');
        let navRel = '';
        if (index > -1) {
            navRel = navbarPath.substr(0, index + 1);
        }
        let currentAbsPath = pathService.getAbsolutePath(window.location.pathname);

        $('#header-navbar').
            find('a[href]').
            each(function (index: number, anchorElement: HTMLAnchorElement) {
                let href = $(anchorElement).attr("href");
                if (pathService.isRelativePath(href)) {
                    href = navRel + href;
                    $(anchorElement).attr("href", href);

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
                        $(anchorElement).parent().addClass('active');
                        breadcrumbsComponent.loadRootBreadCrumb(anchorElement);
                    } else {
                        $(anchorElement).parent().removeClass('active')
                    }
                }
            });
    }
}

export default new HeaderComponent();