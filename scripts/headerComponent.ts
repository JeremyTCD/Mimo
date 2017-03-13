import {
    getAbsolutePath, isRelativePath, getDirectory,
    mediaWidthNarrow
} from './utils';
import {
    toggleHeightForTransition, contractHeightWithoutTransition
} from './transitionsService';
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
            toggleHeightForTransition(wrapper, wrapper);
        });

        $(window).on('resize', () => {
            if (mediaWidthNarrow()) {
                contractHeightWithoutTransition(wrapper, wrapper);
            }
        });
    }

    private setupNavbar() {
        let navbarPath = $("meta[property='docfx\\:navrel']").attr("content");

        if (navbarPath) {
            navbarPath = navbarPath.replace(/\\/g, '/');
        }

        $.get(navbarPath, (data: string) => {
            let navbarUl = $.parseHTML(data);
            $("#header-navbar").append(navbarUl);

            // Query string can be used to perform search on page load
            if ($('#search-results').length !== 0) {
                $('#search').show();
                $('body').trigger("searchEvent");
            }

            this.setNavbarActiveItem(navbarPath);
        });
    }

    private setNavbarActiveItem(navbarPath: string): void {
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