import mediaService from './mediaService';
import listItemService from './listItemService';
import Component from './component';
import debounceService from './debounceService';

class RightMenuComponent extends Component {
    rightMenuElement: HTMLElement = document.getElementById('right-menu');
    wrapperElement: HTMLElement;
    mainContainer: HTMLElement;
    articleHeadingElements: NodeList;
    outlineElement: HTMLElement;
    outlineWrapperElement: HTMLElement;
    outlineTitleElement: HTMLElement;
    outlineAnchors: NodeList;
    indicatorElement: HTMLElement;
    outlineIndicatorSpanElement: HTMLElement;
    outlineLastAnchorElement: HTMLElement;
    outlineRootUlElement: HTMLElement;
    footerElement: HTMLElement;
    shareArticleElement: HTMLElement;
    shareArticleSpanElement: HTMLElement;
    shareArticleLinksWrapperElement: HTMLElement;

    // True if there is no outline, can be because article has no headers to generate an outline from or if outline is disabled
    outlineEmpty: boolean;
    outlineAnchorDataWithoutScroll: { [index: number]: OutlineAnchorData };
    outlineAnchorDataWithScroll: { [index: number]: OutlineAnchorData };
    outlineHeightWithoutScroll: number;
    outlineHeightWithoutScrollPX: string;
    outlineHeightWithScrollPX: string;
    topHeight: number;
    fixedTopBottom: number;

    // Arbitrary gaps
    topMenuGap: number = 16;
    bottomMenuGap: number = 23;

    updateHistoryTimeout: number;

    protected validDomElementExists(): boolean {
        return this.rightMenuElement ? true : false;
    }

    protected setupOnDomContentLoaded(): void {
        this.wrapperElement = this.rightMenuElement.querySelector('.wrapper') as HTMLElement;
        this.mainContainer = document.querySelector('body > .container') as HTMLElement;
        this.articleHeadingElements = document.querySelectorAll('main > article h1:not(.exclude-from-outline),h2:not(.exclude-from-outline)');
        this.outlineWrapperElement = document.querySelector('#right-menu > .wrapper > .wrapper') as HTMLElement;
        this.outlineElement = document.getElementById('outline') as HTMLElement;
        this.indicatorElement = document.getElementById('outline-indicator') as HTMLElement;
        this.outlineIndicatorSpanElement = this.indicatorElement.querySelector('span') as HTMLElement;
        this.footerElement = document.querySelector('body > footer') as HTMLElement;

        this.shareArticleElement = document.getElementById('share-article');
        if (this.shareArticleElement) {
            this.shareArticleSpanElement = document.querySelector('#share-article > span');
            this.shareArticleLinksWrapperElement = document.querySelector('#share-article-links .wrapper');
        }

        this.setupOutline();
        this.outlineTitleElement = document.getElementById('outline-title');
        this.outlineRootUlElement = this.outlineElement.querySelector('ul');

        let outlineAnchorElements = this.outlineElement.querySelectorAll('a');
        this.outlineLastAnchorElement = outlineAnchorElements[outlineAnchorElements.length - 1];
    }

    protected setupOnLoad(): void {
        this.updateRightMenu();
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);

        if (this.shareArticleElement) {
            this.shareArticleSpanElement.addEventListener('mouseenter', this.shareArticleSpanOnEnter);
            this.shareArticleElement.addEventListener('mouseleave', this.shareArticleOnLeave);
        }
    }

    private onResizeListener = (): void => {
        if (this.mainContainer.style.display !== 'none') {
            this.updateRightMenu();
        }
    }

    public onScrollListener = (): void => {
        if (this.mainContainer.style.display !== 'none') {
            let activeHeadingIndex = this.getActiveOutlineIndex();

            if (activeHeadingIndex > -1) {
                // Debounce history update to avoid flashing in url bar and perf overhead
                window.clearTimeout(this.updateHistoryTimeout);
                this.updateHistoryTimeout = window.setTimeout(this.updateHistory, 200, activeHeadingIndex);
            }

            if (mediaService.mediaWidthWide()) {
                this.updateOutline(activeHeadingIndex);
            }
        }
    }

    public shareArticleSpanOnEnter = (): void => {
        this.shareArticleLinksWrapperElement.classList.add('active');
    }

    public shareArticleOnLeave = (): void => {
        this.shareArticleLinksWrapperElement.classList.remove('active');
    }

    public updateRightMenu(): void {
        if (!this.validDomElementExists()) {
            return;
        }

        let activeHeadingIndex = this.getActiveOutlineIndex();
        // Must be called after dom location is set
        this.updateOutline(activeHeadingIndex);
    }

    private updateHistory = (activeHeadingIndex: number): void => {
        let activeHeadingElement = this.articleHeadingElements[activeHeadingIndex] as HTMLElement;
        history.replaceState(null, null, `#${activeHeadingElement.getAttribute('id')}`);
    }

    private updateOutline(activeHeadingIndex: number): void {
        if (this.outlineEmpty) {
            return;
        }

        let fixed = this.wrapperElement.classList.contains('fixed');

        if (mediaService.mediaWidthWide()) {
            if (!this.outlineHeightWithoutScroll) {
                // The first time media width is wide, initialize outline constants. At this point outline has no fixed height, so its height is accurate.
                // Cache tops and heights of outline anchors relative to outline
                this.topHeight = this.outlineElement.getBoundingClientRect().top - this.rightMenuElement.getBoundingClientRect().top;
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

            this.setOutlineHeight(outlineHeight, outlineScrollable);

            if (outlineScrollable && !this.outlineAnchorDataWithScroll) {
                // The first time outline is scrollable, after setting height, initialize constants.
                this.outlineAnchorDataWithScroll = this.createAnchorTopsAndHeightsCache();

                // Set outline indicator height
                // TODO The outline's ul element and indicator element are siblings with a parent that has display flex row.
                // The ul element's height is set to the cross axis height of it's parent - https://bugs.chromium.org/p/chromium/issues/detail?id=134729, 
                // this is what the spec dictates. A work around is to use height: max-content, but it is not supported on edge.
                this.outlineHeightWithScrollPX = `${this.outlineLastAnchorElement.getBoundingClientRect().bottom - this.indicatorElement.getBoundingClientRect().top}px`;
            }

            let activeOutlineAnchorData: OutlineAnchorData = this.getActiveOutlineAnchorData(activeHeadingIndex, outlineScrollable);
            this.updateOutlineIndicator(activeOutlineAnchorData, outlineScrollable);

            if (fix && !fixed) {
                // See leftMenuComponent.updateLeftMenu
                this.rightMenuElement.style.minHeight = `${this.rightMenuElement.clientHeight + 1}px`;
                this.wrapperElement.classList.add('fixed');
            } else if (!fix && fixed) {
                this.wrapperElement.classList.remove('fixed');
                this.rightMenuElement.style.minHeight = 'initial';
            }
        } else {
            this.outlineElement.style.height = 'auto';
            this.indicatorElement.style.height = 'auto';

            if (fixed) {
                this.wrapperElement.classList.remove('fixed');
                this.rightMenuElement.style.minHeight = 'initial';
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

        // Search could be made more efficient, but would be a micro optimization
        for (let i = 0; i < this.articleHeadingElements.length; i++) {
            let headingElement = this.articleHeadingElements[i] as HTMLHeadingElement;
            // Can't be cached since article may have elements that expand/collapse
            let elementDistanceFromTop = Math.abs(headingElement.getBoundingClientRect().top);

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
            - (fixed ? this.fixedTopBottom : this.rightMenuElement.getBoundingClientRect().top + this.topHeight);

        return outlineHeight;
    }

    private setOutlineHeight(outlineHeight: number, outlineScrollable: boolean): void {
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

interface OutlineAnchorData {
    topPX: string;
    heightPX: string;
}

export default new RightMenuComponent();