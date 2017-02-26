import { getAbsolutePath, isRelativePath, getDirectory } from './utils';
import breadcrumbsBuilder from './breadcrumbs';

class NavbarBuilder{
    build(callback: Function) {
        let navbarPath = $("meta[property='docfx\\:navrel']").attr("content");
        let tocPath = $("meta[property='docfx\\:tocrel']").attr("content");

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }

        if (navbarPath) {
            navbarPath = navbarPath.replace(/\\/g, '/');
        }

        $.get(navbarPath, function (data) {
            let toc = $.parseHTML(data);
            $("#header-navbar").append(toc);

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
                            $(anchorElement).parent().addClass('active');
                            breadcrumbsBuilder.loadRootBreadCrumb(anchorElement);
                        } else {
                            $(anchorElement).parent().removeClass('active')
                        }
                    }
                });

            callback();
        });
    }
}

export default new NavbarBuilder();