import {
    getAbsolutePath, isRelativePath, getDirectory
} from './pathService';
import {
    mediaWidthNarrow
} from './mediaService';
import transitionsService from './transitionsService';
import Component from './component';
import breadcrumbsComponent from './breadcrumbsComponent';

class HeaderComponent extends Component {
    protected canInitialize(): boolean {
        return true;
    }

    protected setup(): void {
        this.setupNavbar();
    }

    protected registerListeners(): void {
        let wrapper = $('#header-navbar-and-search > .wrapper');
        $('#header-button').on('click', function () {
            transitionsService.toggleHeightForTransition(wrapper[0], wrapper[0]);
        });

        $(window).on('resize', () => {
            if (mediaWidthNarrow()) {
                transitionsService.contractHeightWithoutTransition(wrapper[0], wrapper[0]);
            }
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

                // TODO allow query string to perform search on page load
                //if ($('#search-results').length !== 0) {
                //    $('#search').show();
                //    $('body').trigger("searchEvent");
                //}

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
        let currentAbsPath = getAbsolutePath(window.location.pathname);

        $('#header-navbar').
            find('a[href]').
            each(function (index: number, anchorElement: HTMLAnchorElement) {
                let href = $(anchorElement).attr("href");
                if (isRelativePath(href)) {
                    href = navRel + href;
                    $(anchorElement).attr("href", href);

                    let isActive = false;
                    let originalHref = anchorElement.name;
                    if (originalHref) {
                        originalHref = navRel + originalHref;
                        if (getDirectory(getAbsolutePath(originalHref)) === getDirectory(getAbsolutePath(tocPath))) {
                            isActive = true;
                        }
                    } else {
                        if (getAbsolutePath(href) === currentAbsPath) {
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