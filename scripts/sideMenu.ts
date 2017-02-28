import { getAbsolutePath, isRelativePath, toggleHeightForTransition } from './utils';
import breadcrumbsBuilder from './breadcrumbs';

class SideMenuBuilder {
    build(): void {
        let tocPath = $("meta[property='docfx\\:tocrel']").attr("content");

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }

        $.get(tocPath, (data) => {
            let toc = $.parseHTML(data);
            $('#side-menu-toc').append(toc);

            this.setupSideMenuOnScroll();
            this.setupTocTopics();
            this.setupTocOnResize();
            this.setupFilter();
            this.setupToggle();

            let index = tocPath.lastIndexOf('/');
            let tocrel = '';
            if (index > -1) {
                tocrel = tocPath.substr(0, index + 1);
            }
            let currentHref = getAbsolutePath(window.location.pathname);

            $('#side-menu-toc').
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
                            parentsUntil('#side-menu-toc').
                            filter('li.expandable').
                            each((index: number, listElement: HTMLLIElement) => {
                                toggleHeightForTransition($(listElement).children('ul'), $(listElement));
                            });

                        breadcrumbsBuilder.
                            loadChildBreadcrumbs($(anchorElement).
                                parentsUntil('#side-menu-toc').
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

    setupToggle(): void {
        let fitlerAndToc = $('#side-menu-filter-and-toc');

        $('#side-menu-toggle').on('click', function () {
            toggleHeightForTransition(fitlerAndToc, fitlerAndToc);
        }); 
    }

    setupTopicPadding(topicElement: JQuery): void {
        let level = topicElement.data('level');
        if (level == 1) {
            return
        }
        topicElement.css('padding-left', (level - 1) * 23 + 'px');
    }

    setupSideMenuOnScroll(): void {
        $(window).scroll((event: JQueryEventObject) => {
            let element = $('#side-menu-filter-and-toc');
            let top = element[0].parentElement.getBoundingClientRect().top;
            if (top < 23) {
                element.addClass('fixed');
                this.setTocMaxHeight();
            } else {
                element.removeClass('fixed');
                $('#side-menu-toc').css('max-height', 'initial');
            }
        });
    }

    setupTocOnResize(): void {
        $(window).on('resize', () => {
            if ($('#side-menu-filter-and-toc').hasClass('fixed')) {
                this.setTocMaxHeight();
            }
        });
    }

    setTocMaxHeight(): void {
        let tocMaxHeight = $(window).outerHeight()
            - 23 * 2
            - $('#side-menu-filter').outerHeight()
            - $('footer').outerHeight();

        $('#side-menu-toc').
            css('max-height', tocMaxHeight);
    }

    setupTocTopics(): void {
        $('#side-menu-toc ul > li.expandable > a').click((event: JQueryEventObject) => {
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
        $('#side-menu-filter-input').on('input', (event: JQueryInputEventObject) => {
            let lis = $('#side-menu-toc li');

            let val = $(event.target).val();
            if (val === '') {
                // Restore toc
                lis.
                    removeClass('filter-hidden').
                    filter('.filter-expanded').
                    each((index: number, liElement: HTMLLIElement) => {
                        toggleHeightForTransition($(liElement).children('ul'), $(liElement));
                    }).
                    removeClass('filter-expanded');

                return;
            }

            lis.
                addClass('filter-hidden').
                removeClass('filter-expanded').
                find('span:not(.icon)').
                each((index: number, spanElement: HTMLSpanElement) => {
                    if (this.contains($(spanElement).text(), val)) {
                        $(spanElement).
                            parentsUntil('#side-menu-toc').
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
                    let showExpanded = $(liElement).hasClass('filter-expanded');
                    let expanded = $(liElement).hasClass('expanded');

                    if (showExpanded && !expanded || !showExpanded && expanded) {
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

export default new SideMenuBuilder();