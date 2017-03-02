import { getAbsolutePath, isRelativePath, toggleHeightForTransition } from './utils';
import breadcrumbsBuilder from './breadcrumbs';

class LeftMenuBuilder {
    build(): void {
        let tocPath = $("meta[property='docfx\\:tocrel']").attr("content");

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }

        $.get(tocPath, (data) => {
            let toc = $.parseHTML(data);
            $('#left-menu-toc').append(toc);

            this.setupOnScroll();
            this.setupTocTopics();
            this.setupTocOnResize();
            this.setupFilter();

            let index = tocPath.lastIndexOf('/');
            let tocrel = '';
            if (index > -1) {
                tocrel = tocPath.substr(0, index + 1);
            }
            let currentHref = getAbsolutePath(window.location.pathname);

            $('#left-menu-toc').
                find('a[href]').
                each((index: number, anchorElement: HTMLAnchorElement) => {
                    let href = $(anchorElement).attr("href");
                    if (isRelativePath(href)) {
                        href = tocrel + href;
                        $(anchorElement).attr("href", href);
                    }

                    this.setupTopicPadding($(anchorElement));

                    if (getAbsolutePath(anchorElement.href) === currentHref) {
                        $(anchorElement).addClass('active');
                        $(anchorElement).
                            parent().
                            parentsUntil('#left-menu-toc').
                            filter('li.expandable').
                            each((index: number, listElement: HTMLLIElement) => {
                                toggleHeightForTransition($(listElement).children('ul'), $(listElement));
                            });

                        breadcrumbsBuilder.
                            loadChildBreadcrumbs($(anchorElement).
                                parentsUntil('#left-menu-toc').
                                filter('li').
                                children('a').
                                add(anchorElement).
                                get().
                                reverse() as HTMLAnchorElement[]);
                    } else {
                        $(anchorElement).removeClass('active');
                    }
                });
        });
    }

    setupTopicPadding(topicElement: JQuery): void {
        let level = topicElement.data('level');
        if (level == 1) {
            return
        }
        topicElement.css('padding-left', (level - 1) * 23 + 'px');
    }

    setupOnScroll(): void {
        $(window).scroll((event: JQueryEventObject) => {
            let element = $('#left-menu > .wrapper');
            let top = element[0].parentElement.getBoundingClientRect().top;
            if (top < 23) {
                element.addClass('fixed');
                this.setTocMaxHeight();
            } else {
                element.removeClass('fixed');
                $('#left-menu-toc').css('max-height', 'initial');
            }
        });
    }

    setupTocOnResize(): void {
        $(window).on('resize', () => {
            if ($('#left-menu > .wrapper').hasClass('fixed')) {
                this.setTocMaxHeight();
            }
        });
    }

    setTocMaxHeight(): void {
        let footerHeight = $(window).outerHeight() - $('footer')[0].getBoundingClientRect().top;
        let maxHeight = $(window).outerHeight()
            - 23 * 2
            - $('#left-menu-filter').outerHeight()
            - (footerHeight < 0 ? 0 : footerHeight);

        $('#left-menu-toc').
            css('max-height', maxHeight);
    }

    setupTocTopics(): void {
        $('#left-menu-toc ul > li.expandable > a').click((event: JQueryEventObject) => {
            let href = $(event.delegateTarget).attr('href');

            if ($(event.target).hasClass('icon') || !href) {
                let closestLi = $(event.target).closest('li');
                let childUl = closestLi.children('ul');
                toggleHeightForTransition(childUl, closestLi);
                event.preventDefault();
                // If event propogates, every parent li.expandable's click listener will
                // be called
                event.stopPropagation();
            }
        });
    }

    setupFilter(): void {
        $('#left-menu-filter-input').on('input', (event: JQueryInputEventObject) => {
            let sideMenuToc = $('#left-menu-toc');
            let lis = sideMenuToc.find('li');

            let val = $(event.target).val();
            if (val === '') {
                // Restore toc
                lis.
                    removeClass('filter-hidden').
                    removeClass('filter-expanded').
                    each((index: number, liElement: HTMLLIElement) => {
                        let preExpanded = $(liElement).hasClass('pre-expanded');
                        let expanded = $(liElement).hasClass('expanded');

                        if (preExpanded && !expanded || !preExpanded && expanded) {
                            toggleHeightForTransition($(liElement).children('ul'), $(liElement));
                        }

                        $(liElement).removeClass('pre-expanded')
                    });

                sideMenuToc.removeClass('filtered');
                return;
            }

            if (!sideMenuToc.hasClass('filtered')) {
                lis.
                    filter('.expanded').
                    addClass('pre-expanded');

                sideMenuToc.addClass('filtered');
            }

            lis.
                addClass('filter-hidden').
                removeClass('filter-expanded').
                find('span:not(.icon)').
                each((index: number, spanElement: HTMLSpanElement) => {
                    if (this.contains($(spanElement).text(), val)) {
                        $(spanElement).
                            parentsUntil('#left-menu-toc').
                            filter('li').
                            each((index: number, liElement: HTMLLIElement) => {
                                $(liElement).removeClass('filter-hidden');

                                if (index !== 0) {
                                    $(liElement).addClass('filter-expanded');
                                }
                            });
                    }
                }).
                end().
                each((index: number, liElement: HTMLLIElement) => {
                    let filterExpanded = $(liElement).hasClass('filter-expanded');
                    let expanded = $(liElement).hasClass('expanded');

                    if (filterExpanded && !expanded || !filterExpanded && expanded) {
                        toggleHeightForTransition($(liElement).children('ul'), $(liElement));
                    }
                });
        });
    }

    contains(text, val): boolean {
        if (!val) {
            return true;
        }
        if (text.
            toLowerCase().
            indexOf(val.toLowerCase()) > -1) {
            return true;
        }
        return false;
    }
}

export default new LeftMenuBuilder();