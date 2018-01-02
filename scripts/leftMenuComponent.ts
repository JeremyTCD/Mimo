import { mediaWidthNarrow } from './mediaService';
import { getAbsolutePath, isRelativePath } from './pathService';
import transitionsService from './transitionsService';
import breadcrumbsComponent from './breadcrumbsComponent';
import Component from './component';

class LeftMenuComponent extends Component {
    bodyContainerElement: HTMLElement;

    protected canInitialize(): boolean {
        return document.getElementById('left-menu') ? true : false;
    }

    protected setup(): void {
        this.bodyContainerElement = document.querySelector('body > .container') as HTMLElement;

        this.setupToc();
        this.setupFilter();
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);
    }

    public onScrollListener = (): void => {
        if (!mediaWidthNarrow() && this.bodyContainerElement.style.display !== 'none') {
            this.setTocFixed();
        }
    }

    public onResizeListener = (): void => {
        if (this.bodyContainerElement.style.display !== 'none') {
            this.setTocFixed();
        }
    }

    private setupToc(): void {
        let tocPath = document.querySelector("meta[property='docfx\\:tocrel']").getAttribute("content");

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }

        let getTocRequest = new XMLHttpRequest()
        getTocRequest.onreadystatechange = (event: Event) => {
            // TODO check status too
            if (getTocRequest.readyState === XMLHttpRequest.DONE) {
                let tocFrag = document.createRange().createContextualFragment(getTocRequest.responseText);
                document.getElementById('left-menu-toc').appendChild(tocFrag);

                this.setTocTopicPadding();
                this.setTocActiveTopic(tocPath);
                this.registerTocTopicListener();
            }
        }
        getTocRequest.open('GET', tocPath)
        getTocRequest.send()

        // Initial call
        this.setTocFixed();
    }

    private registerTocTopicListener() {
        $('#left-menu-toc ul > li.expandable > a, #left-menu-toc ul > li.expandable > span').click((event: JQuery.Event) => {
            let href = $(event.delegateTarget).attr('href');

            if ($(event.target).hasClass('icon') || !href) {
                let closestLi = $(event.target).closest('li');
                let childUl = closestLi.children('ul');
                transitionsService.toggleHeightWithTransition(childUl[0], closestLi[0]);
                event.preventDefault();
                // If event propogates, every parent li.expandable's click listener will
                // be called
                event.stopPropagation();
            }
        });
    }

    private setTocMaxHeight(): void {
        let footerHeight = $(window).outerHeight() - $('footer')[0].getBoundingClientRect().top;
        let maxHeight = $(window).outerHeight()
            - 23 * 2
            - $('#left-menu-filter').outerHeight(true)
            - (footerHeight < 0 ? 0 : footerHeight);

        $('#left-menu-toc').
            css('max-height', maxHeight);
    }

    private setTocActiveTopic(tocPath: string): void {
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

                if (getAbsolutePath(anchorElement.href) === currentHref) {
                    anchorElement.classList.add('active');
                    let expandableLis = $(anchorElement).
                        parent().
                        parentsUntil('#left-menu-toc').
                        filter('li.expandable');

                    // If an element is nested in another element and a height transition is started for both at the same
                    // time, the outer element only transitions to its height. This is because 
                    // toggleHeightForTransition has no way to know the final heights of an element's children. Nested children at
                    // the bottom of the outer element are only revealed when its height is set to auto in its transitionend callback.
                    // Therefore it is necessary to immediately expand nested elements.
                    for (let i = 0; i < expandableLis.length; i++) {
                        let listElement = expandableLis[i];

                        if (i === expandableLis.length - 1) {
                            transitionsService.toggleHeightWithTransition($(listElement).children('ul')[0], listElement);
                        }
                        else {
                            transitionsService.expandHeightWithoutTransition($(listElement).children('ul')[0], listElement);
                        }
                    }

                    breadcrumbsComponent.
                        loadChildBreadcrumbs(
                        $(anchorElement).
                            parentsUntil('#left-menu-toc').
                            filter('li').
                            children('span, a').
                            add(anchorElement).
                            get().
                            reverse() as HTMLAnchorElement[]
                        );
                } else {
                    $(anchorElement).removeClass('active');
                }
            });
    }

    private setTocTopicPadding(): void {
        $('#left-menu-toc').
            find('li > a, li > span').
            each((index: number, anchorElement: HTMLAnchorElement) => {
                let level = $(anchorElement).data('level');
                if (level == 1) {
                    return
                }
                $(anchorElement).css('padding-left', (level - 1) * 14 + 'px');
            });
    }

    private setTocFixed(): void {
        let wrapper = $('#left-menu > .wrapper');
        let top = $('#left-menu > .wrapper')[0].parentElement.getBoundingClientRect().top;

        if (top < 23 && !mediaWidthNarrow()) {
            wrapper.addClass('fixed');
            this.setTocMaxHeight();
        } else {
            wrapper.removeClass('fixed');
            $('#left-menu-toc').css('max-height', 'initial');
        }
    }

    private setupFilter(): void {
        let leftMenuFilterInputElement = document.getElementById('left-menu-filter-input');
        let leftMenuFilterElement = document.getElementById('left-menu-filter');

        // Preferable to use a class over css
        leftMenuFilterInputElement.
            addEventListener('focus', (event: Event) => {
                leftMenuFilterElement.classList.add('focus');
            });
        leftMenuFilterInputElement.
            addEventListener('focusout', (event: Event) => {
                leftMenuFilterElement.classList.remove('focus');
            });

        leftMenuFilterInputElement.addEventListener('input', (event: Event) => {
            let sideMenuTocElement = document.getElementById('left-menu-toc');
            let rootLis = document.querySelectorAll('#left-menu-toc > ul > li');

            let filterValue: string = $(event.target).val().toString();
            if (filterValue === '') {
                // Restore toc
                for (let i = 0; i < rootLis.length; i++) {
                    this.handleLiElement(rootLis[i] as HTMLLIElement, true, true, filterValue)
                }

                sideMenuTocElement.classList.remove('filtered');
                return;
            }

            if (!sideMenuTocElement.classList.contains('filtered')) {
                let expandedLis = sideMenuTocElement.
                    querySelectorAll('.expanded');

                for (let i = 0; i < expandedLis.length; i++) {
                    expandedLis[i].classList.add('pre-expanded');
                }

                sideMenuTocElement.classList.add('filtered');
            }

            for (let i = 0; i < rootLis.length; i++) {
                this.handleLiElement(rootLis[i] as HTMLLIElement, true, false, filterValue)
            }
        });
    }

    private handleLiElement = (liElement: HTMLLIElement, allParentsExpanded: boolean, restore: boolean, filterValue: string): void => {
        let expanded = liElement.classList.contains('expanded');

        // Reset
        liElement.classList.remove('filter-hidden', 'filter-expanded', 'filter-match');

        // Visit all children
        let expand: boolean = false;
        $(liElement).
            find('> ul > li').
            each((index: number, childLiElement: HTMLLIElement) => {
                this.handleLiElement(childLiElement, allParentsExpanded && expanded, restore, filterValue);

                if (!restore && !expand && !childLiElement.classList.contains('filter-hidden')) {
                    expand = true;
                }
            });

        if (restore) {
            let preExpanded = liElement.classList.contains('pre-expanded');
            liElement.classList.remove('pre-expanded')

            if (preExpanded && !expanded) {
                if (allParentsExpanded) {
                    transitionsService.toggleHeightWithTransition($(liElement).children('ul')[0], liElement);
                } else {
                    transitionsService.toggleHeightWithoutTransition($(liElement).children('ul')[0], liElement);
                }
            }
            else if (!preExpanded && expanded) {
                transitionsService.toggleHeightWithTransition($(liElement).children('ul')[0], liElement);
            }
        } else {
            // Expand if any children are displayed
            if (expand) {
                liElement.classList.add('filter-expanded');

                if (!expanded) {
                    if (allParentsExpanded) {
                        transitionsService.toggleHeightWithTransition($(liElement).children('ul')[0], liElement);
                    } else {
                        transitionsService.toggleHeightWithoutTransition($(liElement).children('ul')[0], liElement);
                    }
                }
            }

            // Check if it matches
            let displayedElement = $(liElement).children('span, a')[0];
            let displayedText = $(displayedElement).text();
            let matches = this.contains(displayedText, filterValue);

            if (matches) {
                liElement.classList.add('filter-match');
            }

            if (!liElement.classList.contains('filter-expanded')) {
                if (!matches) {
                    liElement.classList.add('filter-hidden');
                }

                if (expanded) {
                    transitionsService.toggleHeightWithTransition($(liElement).children('ul')[0], liElement);
                }
            }
        }
    }

    private contains(text, val): boolean {
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

export default new LeftMenuComponent();