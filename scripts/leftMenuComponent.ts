import mediaService from './mediaService';
import pathService from './pathService';
import transitionsService from './transitionsService';
import breadcrumbsComponent from './breadcrumbsComponent';
import Component from './component';
import edgeWorkaroundsService from './edgeWorkaroundsService';
import svgService from './svgService';
import TextInputService from './textInputService';

class LeftMenuComponent extends Component {
    leftMenuElement: HTMLElement = document.getElementById('left-menu');
    bodyContainerElement: HTMLElement;
    leftMenuTocElement: HTMLElement;
    leftMenuFilterInputElement: HTMLInputElement;
    leftMenuFilterElement: HTMLElement;
    leftMenuClearElement: HTMLElement;
    textInputService: TextInputService;
    tocElement: HTMLElement;
    tocRootLIElements: NodeList;
    tocTopicElements: NodeList;
    footerElement: HTMLElement;

    protected validDomElementExists(): boolean {
        return this.leftMenuElement ? true : false;
    }

    protected setup(): void {
        this.leftMenuFilterElement = document.getElementById('left-menu-filter');
        this.leftMenuFilterInputElement = this.leftMenuFilterElement.querySelector('input');
        this.leftMenuClearElement = this.leftMenuFilterElement.querySelector('svg:last-child') as HTMLElement;
        this.bodyContainerElement = document.querySelector('body > .container') as HTMLElement;
        this.leftMenuTocElement = document.getElementById('left-menu-toc');
        this.tocElement = document.getElementById('left-menu-toc');
        this.footerElement = document.getElementsByTagName('footer')[0];

        this.setupToc();

        this.textInputService = new TextInputService(
            this.leftMenuFilterElement,
            this.leftMenuFilterInputElement,
            this.leftMenuClearElement,
            () => {
                this.restoreToc();
            });
        this.textInputService.setupEventListeners();
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);
    }

    public onScrollListener = (): void => {
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

                // Can only get root li elements after inserting toc frag
                this.tocRootLIElements = document.querySelectorAll('#left-menu-toc > ul > li');
                this.tocTopicElements = document.querySelectorAll('#left-menu-toc ul > li.expandable > span');
                this.setupFilter();

                this.setTocTopicPadding();
                this.setTocActiveTopic(tocPath);
                this.registerTocTopicListener();
            }
        }
        getTocRequest.open('GET', tocPath)
        getTocRequest.send()

        // Initial call
        this.updateLeftMenu();
    }

    private registerTocTopicListener() {
        for (let i = 0; i < this.tocTopicElements.length; i++) {
            let tocTopic = this.tocTopicElements[i] as HTMLElement;

            tocTopic.addEventListener('click', (event: Event) => {
                let parentLI = tocTopic.parentElement;
                // According to MDN browsers use DFS with pre-order processing, so the ul should be the direct child
                let childUl = parentLI.querySelector('ul');
                transitionsService.toggleHeightWithTransition(childUl, parentLI);
                event.preventDefault();
                // If event propogates, every parent li.expandable's click listener will
                // be called
                event.stopPropagation();
            });
        }
    }

    private setTocMaxHeight(): void {
        let footerTop = this.footerElement.getBoundingClientRect().top;
        let footerHeight = window.innerHeight - footerTop;
        let leftMenuFilterStyle = getComputedStyle(this.leftMenuFilterElement);
        let tocMaxHeight = window.innerHeight
            - 23 * 2
            - this.leftMenuFilterElement.offsetHeight
            - parseFloat(leftMenuFilterStyle.marginTop)
            - parseFloat(leftMenuFilterStyle.marginBottom)
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
        let tocAnchorElements = this.tocElement.querySelectorAll('a');

        for (let i = 0; i < tocAnchorElements.length; i++) {
            let anchorElement = tocAnchorElements[i];

            let href = anchorElement.getAttribute("href");
            if (pathService.isRelativePath(href)) {
                href = tocrel + href;
                anchorElement.setAttribute("href", href);
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
                anchorElement.classList.remove('active');
            }
        }
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
        this.leftMenuFilterInputElement.addEventListener('input', (event: Event) => {
            let filterValue: string = this.leftMenuFilterInputElement.value;
            if (filterValue === '') {
                this.restoreToc();
                return;
            }

            if (!this.tocElement.classList.contains('filtered')) {
                this.saveTocState();
                this.tocElement.classList.add('filtered');
            }

            for (let i = 0; i < this.tocRootLIElements.length; i++) {
                this.setLIElementState(this.tocRootLIElements[i] as HTMLLIElement, filterValue);
                this.setLIElementHeight(this.tocRootLIElements[i] as HTMLLIElement, true);
            }
        });
    }

    private saveTocState = () => {
        let expandedLis = this.tocElement.
            querySelectorAll('.expanded');

        for (let i = 0; i < expandedLis.length; i++) {
            expandedLis[i].classList.add('pre-expanded');
        }
    }

    private restoreToc = () => {
        if (this.tocElement.classList.contains('filtered')) {
            for (let i = 0; i < this.tocRootLIElements.length; i++) {
                this.restoreLIElement(this.tocRootLIElements[i] as HTMLLIElement, true);
            }

            this.tocElement.classList.remove('filtered');
        }
    }

    // An LI element can have three possible states, filter-expanded, filter-match and filter-hidden. filter-hidden is mutually exclusive from the other
    // two states, also an element can have the filter-match state but not the filter-expanded state. An LI element has the filter-match state if its 
    // contents contain the filter value. It has the filter-expanded state if any of its children has the filter-match or filter-expanded states.
    // Lastly, it has the filter-hidden state if it does not have either of the filter-match or filter-expanded states.
    //
    // Since LI elements are organized as a tree and the states of children must be determined first, this state setting function 
    // performs a depth first search, post order.
    private setLIElementState = (liElement: HTMLLIElement, filterValue: string = null): void => {
        // Reset
        this.resetLIElement(liElement);

        let directChildULElement = liElement.querySelector('ul');
        let toBeExpanded: boolean = false;

        // Skip leaves
        if (directChildULElement) {
            let closestChildLIElements = directChildULElement.children;

            for (let i = 0; i < closestChildLIElements.length; i++) {
                let childLIElement = closestChildLIElements[i] as HTMLLIElement;
                this.setLIElementState(childLIElement, filterValue);

                if (!toBeExpanded && !childLIElement.classList.contains('filter-hidden')) {
                    toBeExpanded = true;
                    liElement.classList.add('filter-expanded');
                }
            }
        }

        // Check if text matches
        let displayedElement = liElement.querySelector('span, a');
        let displayedText = displayedElement.textContent;
        let matches = this.contains(displayedText, filterValue);

        if (matches) {
            liElement.classList.add('filter-match');
        } else if (!toBeExpanded) {
            // Does not match and has no children that match
            liElement.classList.add('filter-hidden');
        }
    }

    // Restore Toc to initial state. DFS in post-order since child elements must be assigned their height values
    // before animations are started for parent elements (parent elements need to know how much to grow).
    private restoreLIElement = (liElement: HTMLLIElement, allParentsAlreadyExpanded: boolean): void => {
        // Reset
        this.resetLIElement(liElement);

        let directChildULElement = liElement.querySelector('ul');

        // Leaves don't need their heights toggled
        if (directChildULElement) {
            let alreadyExpanded = liElement.classList.contains('expanded');
            let preExpanded = liElement.classList.contains('pre-expanded');
            let closestChildLIElements = directChildULElement.children;

            liElement.classList.remove('pre-expanded')

            for (let i = 0; i < closestChildLIElements.length; i++) {
                this.restoreLIElement(closestChildLIElements[i] as HTMLLIElement, allParentsAlreadyExpanded && alreadyExpanded);
            }

            if (preExpanded && !alreadyExpanded) {
                if (allParentsAlreadyExpanded) {
                    transitionsService.toggleHeightWithTransition(directChildULElement, liElement);
                } else {
                    transitionsService.toggleHeightWithoutTransition(directChildULElement, liElement);
                }
            }
            else if (!preExpanded && alreadyExpanded) {
                transitionsService.toggleHeightWithTransition(directChildULElement, liElement);
            }
        }
    }

    // Called after setLIElementState. setLIElementState sets some elements to "display: none" threough the filter-hidden class.
    // It is necessary to process the entire tree before toggling heights, since the final height of each element must be known.
    private setLIElementHeight = (liElement: HTMLLIElement, allParentsAlreadyExpanded: boolean): void => {
        let directChildULElement = liElement.querySelector('ul');

        // Leaves don't need their heights toggled
        if (directChildULElement) {
            let alreadyExpanded = liElement.classList.contains('expanded');
            let toBeExpanded = liElement.classList.contains('filter-expanded');
            let closestChildLIElements = directChildULElement.children;

            for (let i = 0; i < closestChildLIElements.length; i++) {
                this.setLIElementHeight(closestChildLIElements[i] as HTMLLIElement, allParentsAlreadyExpanded && alreadyExpanded);
            }

            if (toBeExpanded && !alreadyExpanded) {
                if (allParentsAlreadyExpanded) {
                    transitionsService.toggleHeightWithTransition(directChildULElement, liElement);
                } else {
                    transitionsService.toggleHeightWithoutTransition(directChildULElement, liElement);
                }
            } else if (!toBeExpanded && alreadyExpanded) {
                transitionsService.toggleHeightWithTransition(directChildULElement, liElement);
            }
        }
    }

    private resetLIElement = (liElement: HTMLLIElement): void => {
        liElement.classList.remove('filter-hidden', 'filter-expanded', 'filter-match');
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