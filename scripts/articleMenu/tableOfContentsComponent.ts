import mediaService from './mediaService';
import listItemService from './listItemService';
import IComponent from './IComponent';
import debounceService from './debounceService';
import ResizeObserver from 'resize-observer-polyfill';
import transitionsService from './transitionsService';
import * as SmoothScroll from 'smooth-scroll';

export default class TableOfContentsComponent implements IComponent {
    outlineElement: HTMLElement;
    outlineWrapperElement: HTMLElement;
    outlineTitleElement: HTMLElement;
    outlineAnchors: NodeList;
    indicatorElement: HTMLElement;
    outlineIndicatorSpanElement: HTMLElement;
    outlineLastAnchorElement: HTMLElement;
    outlineRootUlElement: HTMLElement;
    footerElement: HTMLElement;


    lastScrollY: number;
    scrollToDropdownHeader: SmoothScroll;
    // True if there is no outline, can be because article has no headers to generate an outline from or if outline is disabled
    outlineEmpty: boolean;
    outlineAnchorDataWithoutScroll: { [index: number]: OutlineAnchorData };
    outlineAnchorDataWithScroll: { [index: number]: OutlineAnchorData };
    outlineHeightWithoutScroll: number;
    outlineHeightWithoutScrollPX: string;
    outlineHeightWithScrollPX: string;
    topHeight: number;
    fixedTopBottom: number;

    dropdownHeaderData: DropdownHeaderData[];

    // Arbitrary gaps
    topMenuGap: number = 16;
    bottomMenuGap: number = 23;

    updateHistoryTimeout: number;

    protected validDomElementExists(): boolean {
        return this.articleMenuElement ? true : false;
    }

    protected setupOnDomContentLoaded(): void {
        this.outlineWrapperElement = document.getElementById('outline-wrapper') as HTMLElement;
        this.outlineElement = document.getElementById('outline') as HTMLElement;
        this.indicatorElement = document.getElementById('outline-indicator') as HTMLElement;
        this.outlineIndicatorSpanElement = this.indicatorElement.querySelector('span') as HTMLElement;
        this.footerElement = document.querySelector('body > footer') as HTMLElement;

        this.setupOutline();
        this.outlineTitleElement = document.getElementById('outline-title');
        this.outlineRootUlElement = this.outlineElement.querySelector('ul');
        let outlineAnchorElements = this.outlineElement.querySelectorAll('a');
        this.outlineLastAnchorElement = outlineAnchorElements[outlineAnchorElements.length - 1];

        this.scrollToDropdownHeader = new SmoothScroll();
    }

    protected setupOnLoad(): void {
        // Makes initial call to updateArticleMenu (initial call is defined in the spec) - https://github.com/WICG/ResizeObserver/issues/8
        this.bodyResizeObserver.observe(document.body);
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);

        this.bodyResizeObserver = new ResizeObserver(this.onResizeListener);

        if (this.shareArticleElement) {
            this.shareArticleSpanElement.addEventListener('mouseenter', this.shareArticleSpanOnEnter);
            this.shareArticleElement.addEventListener('mouseleave', this.shareArticleOnLeave);
        }

        this.dropdownButton.addEventListener('click', (event: Event) => {
            transitionsService.toggleHeightWithTransition(this.linksAndOutlineWrapperElement, this.dropdownButton);

            if (this.dropdownButton.classList.contains('expanded')) {
                // If fixed, dropdown is already at the top of the screen
                if (!this.wrapperElement.classList.contains('fixed')) {
                    this.lastScrollY = window.scrollY;
                    this.scrollToDropdownHeader.animateScroll(this.dropdownWrapperElement, null, { speed: 400 });
                }
            } else {
                if (!this.wrapperElement.classList.contains('fixed')) {
                    this.scrollToDropdownHeader.animateScroll(this.lastScrollY, null, { speed: 400 });
                }
            }
        });

        window.addEventListener('resize', (event: Event) => {
            if (!mediaService.mediaWidthNarrow()) {
                transitionsService.contractHeightWithoutTransition(this.linksAndOutlineWrapperElement, this.dropdownButton);
            }
        });
    }

    private onResizeListener = (): void => {
        if (this.coreElement.style.display !== 'none') {
            this.updateArticleMenu();
        }
    }

    public onScrollListener = (): void => {
        if (this.coreElement.style.display !== 'none') {
            let activeHeadingIndex = this.getActiveOutlineIndex();

            // Debounce history update to avoid flashing in url bar and perf overhead
            window.clearTimeout(this.updateHistoryTimeout);
            this.updateHistoryTimeout = window.setTimeout(this.updateHistory, 200, activeHeadingIndex);

            if (!mediaService.mediaWidthNarrow()) {
                this.updateOutline(activeHeadingIndex);
            } else {
                this.updateDropdownHeader(activeHeadingIndex);
            }
        }
    }

    public shareArticleSpanOnEnter = (): void => {
        this.shareArticleLinksWrapperElement.classList.add('active');
    }

    public shareArticleOnLeave = (): void => {
        this.shareArticleLinksWrapperElement.classList.remove('active');
    }

    public updateArticleMenu(): void {
        if (!this.validDomElementExists()) {
            return;
        }

        let activeHeadingIndex = this.getActiveOutlineIndex();
        this.updateOutline(activeHeadingIndex);
        this.updateDropdownHeader(activeHeadingIndex);
        this.updateDropdown();
    }

    private updateDropdown = (): void => {
        if (!mediaService.mediaWidthWide()) {
            this.linksAndOutlineWrapperElement.style.maxHeight = `${window.innerHeight - 37}px`;
        } else {
            this.linksAndOutlineWrapperElement.style.maxHeight = 'initial';
        }
    }

    public updateDropdownHeader(activeHeadingIndex: number): void {
        let fixed = this.wrapperElement.classList.contains('fixed');
        let fix = this.articleMenuElement.getBoundingClientRect().top < 0

        // If top is above top of screen, add class fixed else, remove class fixed
        if (!fixed && fix) {
            this.wrapperElement.classList.add('fixed');
        } else if (fixed && !fix) {
            this.wrapperElement.classList.remove('fixed');
        }

        if (activeHeadingIndex === -1) {
            this.dropdownTextH1Element.innerText = 'Table of Contents';
            this.dropdownTextH2Element.parentElement.style.display = 'none';
            return;
        }

        let headerData: DropdownHeaderData = this.dropdownHeaderData[activeHeadingIndex];

        this.dropdownTextH1Element.innerText = headerData.h1Text;

        if (headerData.h2Text) {
            this.dropdownTextH2Element.innerText = headerData.h2Text;
            this.dropdownTextH2Element.parentElement.style.display = 'flex';
        } else {
            this.dropdownTextH2Element.parentElement.style.display = 'none';
        }
    }

    public setupDropdownHeader(articleHeadingElements: NodeList): void {
        let currentH1Text: string;

        this.dropdownHeaderData = [];

        for (let i = 0; i < articleHeadingElements.length; i++) {
            let articleHeadingElement = articleHeadingElements[i] as HTMLElement;

            if (articleHeadingElement.nodeName === "H1") {
                currentH1Text = articleHeadingElement.innerText;
                this.dropdownHeaderData.push({ h1Text: currentH1Text, h2Text: null });
            } else {
                // h2
                this.dropdownHeaderData.push({ h1Text: currentH1Text, h2Text: articleHeadingElement.innerText });
            }
        }
    }

    private updateHistory = (activeHeadingIndex: number): void => {
        let id = null;

        if (activeHeadingIndex > -1) {
            id = (this.articleHeadingElements[activeHeadingIndex] as HTMLElement).getAttribute('id');
        }

        history.replaceState(null, null, id ? `#${id}` : location.pathname);
    }

    private updateOutline(activeHeadingIndex: number): void {
        if (this.outlineEmpty) {
            return;
        }

        let fixed = this.wrapperElement.classList.contains('fixed');

        if (!mediaService.mediaWidthNarrow()) {
            if (!this.outlineHeightWithoutScroll) {
                // The first time media width is wide, initialize outline constants. At this point outline has no fixed height, so its height is accurate.
                // Cache tops and heights of outline anchors relative to outline
                this.topHeight = this.outlineElement.getBoundingClientRect().top - this.articleMenuElement.getBoundingClientRect().top;
                this.fixedTopBottom = this.topMenuGap + this.topHeight;

                let indicatorBoundingRect = this.indicatorElement.getBoundingClientRect();
                // TODO does font affect height? Is height dependent solely on font-size?
                // Get height of outline without scrollbar
                this.outlineHeightWithoutScroll = indicatorBoundingRect.height;
                this.outlineHeightWithoutScrollPX = `${this.outlineHeightWithoutScroll}px`;
                this.outlineAnchorDataWithoutScroll = this.createAnchorTopsAndHeightsCache();
            }

            let top = this.wrapperElement.parentElement.getBoundingClientRect().top;
            let fix = top < this.topMenuGap;

            // To prevent layouts, do all reads before writes
            let outlineHeight: number = this.getOutlineHeight(fix);
            let outlineScrollable = this.outlineHeightWithoutScroll > outlineHeight;

            this.setOutlineStyles(outlineHeight, outlineScrollable);

            if (outlineScrollable && !this.outlineAnchorDataWithScroll) {
                // The first time outline is scrollable, after setting height, initialize constants.
                this.outlineAnchorDataWithScroll = this.createAnchorTopsAndHeightsCache();

                // Set outline indicator height
                // TODO The outline's ul element and indicator element are siblings with a parent that has display flex row.
                // The ul element's height is set to the cross axis height of it's parent - https://bugs.chromium.org/p/chromium/issues/detail?id=134729, 
                // this is what the spec dictates. A work around is to use height: max-content, but it is not supported on edge.
                this.outlineHeightWithScrollPX = `${this.outlineLastAnchorElement.getBoundingClientRect().bottom - this.indicatorElement.getBoundingClientRect().top}px`;
            }

            let activeOutlineAnchorData: OutlineAnchorData = this.getActiveOutlineAnchorData(activeHeadingIndex > -1 ? activeHeadingIndex : 0, outlineScrollable);
            this.updateOutlineIndicator(activeOutlineAnchorData, outlineScrollable);

            if (fix && !fixed) {
                // See sectionMenuComponent.updateSectionMenu
                this.articleMenuElement.style.minHeight = `${this.articleMenuElement.clientHeight + 1}px`;
                this.wrapperElement.classList.add('fixed');
            } else if (!fix && fixed) {
                this.wrapperElement.classList.remove('fixed');
                this.articleMenuElement.style.minHeight = 'initial';
            }
        } else {
            this.outlineElement.style.height = 'auto';
            this.indicatorElement.style.height = 'auto';

            if (fixed) {
                this.wrapperElement.classList.remove('fixed');
                this.articleMenuElement.style.minHeight = 'initial';
            }
        }
    }

    private setupOutline(): void {
        if (this.articleHeadingElements.length === 0) {
            this.outlineEmpty = true;
            return;
        } else {
            this.outlineEmpty = false;
        }

        let titleElement = document.querySelector('main > article > .title');
        let outlineTitle = titleElement ? titleElement.textContent : 'Outline';
        let outlineTitleSpanElement = document.querySelector('#outline-title > span');

        outlineTitleSpanElement.innerHTML = outlineTitle;

        let listItemTrees: ListItem[] = listItemService.generateListItemTrees(this.articleHeadingElements,
            ['h1', 'h2'],
            document.createElement('a'));
        let ulElement = listItemService.generateMultiLevelList(listItemTrees, '', 1);

        this.outlineElement.appendChild(ulElement);
        this.outlineAnchors = this.outlineElement.querySelectorAll('a');
    }

    private getActiveOutlineIndex(): number {
        let activeAnchorIndex = -1;
        let minDistance = -1;

        // TODO: try binary search instead (profile, might not be worth the overhead since articles typically don't have many headings)
        for (let i = 0; i < this.articleHeadingWrapperElements.length; i++) {
            let headingElement = this.articleHeadingWrapperElements[i] as HTMLHeadingElement;
            // When screen is narrow, fixed header occupies 37px at top of screen
            let elementDistanceFromTop = -headingElement.getBoundingClientRect().top + (mediaService.mediaWidthNarrow() ? 37 : 0);

            // Only consider heading wrappers that are above the top of the screen
            if (elementDistanceFromTop < 0) {
                return activeAnchorIndex;
            }

            if (minDistance === -1 || elementDistanceFromTop < minDistance) {
                minDistance = elementDistanceFromTop;
                activeAnchorIndex = i;
            } else {
                break;
            }
        }

        return activeAnchorIndex;
    }

    private getActiveOutlineAnchorData(activeAnchorIndex: number, outlineScrollable: boolean): OutlineAnchorData {
        return outlineScrollable ? this.outlineAnchorDataWithScroll[activeAnchorIndex] :
            this.outlineAnchorDataWithoutScroll[activeAnchorIndex];
    }

    private updateOutlineIndicator(activeOutlineAnchorData: OutlineAnchorData, outlineScrollable: boolean): void {
        if (!outlineScrollable) {
            this.indicatorElement.style.height = this.outlineHeightWithoutScrollPX;
        } else {
            this.indicatorElement.style.height = this.outlineHeightWithScrollPX;
        }

        // Even if active anchor has not changed, must rewrite since scrollbar may have appeared
        let style = this.outlineIndicatorSpanElement.style;
        style.marginTop = activeOutlineAnchorData.topPX;
        style.height = activeOutlineAnchorData.heightPX;
    }

    private getOutlineHeight(fixed: boolean): number {
        let footerTop = this.footerElement.getBoundingClientRect().top;

        let outlineHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
            - this.bottomMenuGap
            - (fixed ? this.fixedTopBottom : this.articleMenuElement.getBoundingClientRect().top + this.topHeight);

        return outlineHeight < 0 ? 0 : outlineHeight;
    }

    private setOutlineStyles(outlineHeight: number, outlineScrollable: boolean): void {
        // Tried setting bottom, max-height, both don't work on edge - scroll bar doesn't go away even when height is greater than 
        // menu height. This works.
        this.outlineElement.style.height = `${outlineHeight}px`;

        if (outlineScrollable) {
            this.outlineRootUlElement.style.marginRight = '12px';
        } else {
            this.outlineRootUlElement.style.marginRight = '0';
        }
    }

    private createAnchorTopsAndHeightsCache(): { [index: number]: OutlineAnchorData } {
        let outlineIndicatorBoundingRect = this.indicatorElement.getBoundingClientRect();
        let result: { [index: number]: OutlineAnchorData } = {};

        for (let i = 0; i < this.outlineAnchors.length; i++) {
            let outlineAnchor = this.outlineAnchors[i] as HTMLElement;
            let anchorBoundingRect = outlineAnchor.getBoundingClientRect();

            result[i] = {
                topPX: `${anchorBoundingRect.top - outlineIndicatorBoundingRect.top}px`,
                heightPX: `${anchorBoundingRect.height}px`
            };
        }

        return result;
    }
}

interface DropdownHeaderData {
    h1Text: string;
    h2Text: string;
}

interface OutlineAnchorData {
    topPX: string;
    heightPX: string;
}