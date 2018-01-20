import mediaService from './mediaService';
import pathService from './pathService';
import transitionsService from './transitionsService';
import breadcrumbsComponent from './breadcrumbsComponent';
import Component from './component';
import edgeWorkaroundsService from './edgeWorkaroundsService';
import svgService from './svgService';

class LeftMenuComponent extends Component {
    leftMenuElement: HTMLElement = document.getElementById('left-menu');
    bodyContainerElement: HTMLElement;
    leftMenuTocElement: HTMLElement;

    protected validDomElementExists(): boolean {
        return this.leftMenuElement ? true : false;
    }

    protected setup(): void {
        this.bodyContainerElement = document.querySelector('body > .container') as HTMLElement;
        this.leftMenuTocElement = document.getElementById('left-menu-toc');
        this.leftMenuElement = document.getElementById('left-menu');

        this.setupToc();
        this.setupFilter();
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);
    }

    private onScrollListener = (): void => {
        if (!mediaService.mediaWidthNarrow() && this.bodyContainerElement.style.display !== 'none') {
            this.updateLeftMenu();
        }
    }

    private onResizeListener = (): void => {
        if (this.bodyContainerElement.style.display !== 'none') {
            this.updateLeftMenu();
        }
    }

    private setupToc = (): void => {
        let tocPath = document.querySelector("meta[property='docfx\\:tocrel']").getAttribute("content");

        if (tocPath) {
            tocPath = tocPath.replace(/\\/g, '/');
        }

        let getTocRequest = new XMLHttpRequest()
        getTocRequest.onreadystatechange = (event: Event) => {
            // TODO check status too
            if (getTocRequest.readyState === XMLHttpRequest.DONE) {
                let tocFrag = document.createRange().createContextualFragment(getTocRequest.responseText);
                let svgElement: SVGElement = svgService.createSvgExternalSpriteElement('material-design-chevron-right');
                let items = tocFrag.querySelectorAll('li > a, li > span');

                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    item.insertBefore(svgElement.cloneNode(true), item.firstChild);
                }

                this.leftMenuTocElement.appendChild(tocFrag);

                this.setTocActiveTopic(tocPath);
                this.setTocTopicPadding();
                this.registerTocTopicListener();
            }
        }
        getTocRequest.open('GET', tocPath)
        getTocRequest.send()

        // Initial call
        this.updateLeftMenu();
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
        let footerTop = $('footer')[0].getBoundingClientRect().top
        let footerHeight = $(window).outerHeight() - footerTop;
        let tocMaxHeight = $(window).outerHeight()
            - 23 * 2
            - $('#left-menu-filter').outerHeight(true)
            - (footerHeight < 0 ? 0 : footerHeight);

        this.leftMenuTocElement.style.maxHeight = `${tocMaxHeight}px`;
    }

    private setTocActiveTopic(tocPath: string): void {
        let index = tocPath.lastIndexOf('/');
        let tocrel = '';
        if (index > -1) {
            tocrel = tocPath.substr(0, index + 1);
        }
        let currentHref = pathService.getAbsolutePath(window.location.pathname);

        $('#left-menu-toc').
            find('a[href]').
            each((index: number, anchorElement: HTMLAnchorElement) => {
                let href = $(anchorElement).attr("href");
                if (pathService.isRelativePath(href)) {
                    href = tocrel + href;
                    $(anchorElement).attr("href", href);
                }

                if (pathService.getAbsolutePath(anchorElement.href) === currentHref) {
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

                        // TODO generalize and move to edgeWorkaroundsService
                        // Yet another Edge workaround - 
                        // On page load, Edge does not rotate the svg until mouse hovers over the li element it is contained in.
                        // This is a really dirty temporary fix that forces the rotation.
                        let svgElement = listElement.firstElementChild.firstElementChild as SVGSVGElement;
                        svgElement.style.transform = 'rotate(90deg)';
                        svgElement.style.transform = '';
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

    public updateLeftMenu(): void {
        if (!this.validDomElementExists()) {
            return;
        }

        let wrapper = document.querySelector('#left-menu > .wrapper');
        let top = this.leftMenuElement.getBoundingClientRect().top;
        let fixed = wrapper.classList.contains('fixed'); // why wrapper? why not on left menu

        // toc should only be fixed if left menu is less than 23 px below top of window
        // and screen is not narrow
        if (top < 23 && !mediaService.mediaWidthNarrow()) {
            this.setTocMaxHeight();

            if (!fixed) {
                // If a page's article's height is less than its left menu's height, when the toc's position is set to fixed, the footer will shift up.
                // This causes the page to shrink vertically, which in turn, increases the top value of all elements (can fit more on the screen, 
                // so everything moves down). When left menu moves down, this functions triggers again and toc's position is set to initial. This makes 
                // it becomes impossible to scroll past the point where toc becomes fixed. This simple fix prevents that by preventing footer from shifting up.
                // Note: clientHeight is rounded to an integer, but I can't find any evidence that it gets rounded up on all browsers, so add 1.
                this.leftMenuElement.style.minHeight = `${this.leftMenuElement.clientHeight + 1}px`;

                wrapper.classList.add('fixed');
            } 
            edgeWorkaroundsService.overflowBugWorkaround(this.leftMenuTocElement);
        } else if (fixed) {
            wrapper.classList.remove('fixed');
            this.leftMenuElement.style.minHeight = 'initial';
            this.leftMenuTocElement.style.maxHeight = 'initial';
            edgeWorkaroundsService.overflowBugWorkaround(this.leftMenuTocElement);
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