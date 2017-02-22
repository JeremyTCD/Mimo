import { getAbsolutePath, isRelativePath, getDirectory } from './shared';
import breadcrumbsBuilder from './breadcrumbs';

export default function setupNavbar() {
    let navbarPath = $("meta[property='docfx\\:navrel']").attr("content");
    let tocPath = $("meta[property='docfx\\:tocrel']").attr("content");

    if (tocPath) {
        tocPath = tocPath.replace(/\\/g, '/');
    }

    if (navbarPath) {
        navbarPath = navbarPath.replace(/\\/g, '/');
    }

    $.get(navbarPath, function (data) {
        $(data).
            find("#toc>ul").
            appendTo("#header-navbar");

        if ($('#search-results').length !== 0) {
            $('#search').show();
            $('body').trigger("searchEvent");
        }

        let index = navbarPath.lastIndexOf('/');
        let navrel = '';
        if (index > -1) {
            navrel = navbarPath.substr(0, index + 1);
        }
        let currentAbsPath = getAbsolutePath(window.location.pathname);

        // set active item
        $('#header-navbar').
            find('a[href]').
            each(function (index: number, anchorElement: HTMLAnchorElement) {
                let href = $(anchorElement).attr("href");
                if (isRelativePath(href)) {
                    href = navrel + href;
                    $(anchorElement).attr("href", href);

                    let isActive = false;
                    let originalHref = anchorElement.name;
                    if (originalHref) {
                        originalHref = navrel + originalHref;
                        if (getDirectory(getAbsolutePath(originalHref)) === getDirectory(getAbsolutePath(tocPath))) {
                            isActive = true;
                        }
                    } else {
                        if (getAbsolutePath(href) === currentAbsPath) {
                            isActive = true;
                        }
                    }
                    if (isActive) {
                        $(anchorElement).addClass('active');
                        breadcrumbsBuilder.loadRootBreadCrumb(anchorElement);
                    } else {
                        $(anchorElement).removeClass('active')
                    }
                }
            });
    });
}