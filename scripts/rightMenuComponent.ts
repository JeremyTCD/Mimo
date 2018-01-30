import mediaService from './mediaService';
import listItemService from './listItemService';
import edgeWorkaroundsService from './edgeWorkaroundsService';
import Component from './component';

class RightMenuComponent extends Component {
    rightMenuElement: HTMLElement = document.getElementById('right-menu');
    editArticleElement: HTMLElement;
    articleElement: HTMLElement;
    mainContainer: HTMLElement;
    articleHeadingElements: NodeList;
    outlineElement: HTMLElement;
    metadataElement: HTMLElement;
    outlineWrapperElement: HTMLElement;
    outlineTitleElement: HTMLElement;
    outlineAnchors: NodeList;
    outlineIndicatorElement: HTMLElement;
    outlineIndicatorSpanElement: HTMLElement;
    outlineLastAnchorElement: HTMLElement;

    activeAnchorIndex: number;

    protected validDomElementExists(): boolean {
        return this.rightMenuElement ? true : false;
    }

    protected setup(): void {
        this.editArticleElement = document.getElementById('edit-article');
        this.articleElement = document.querySelector('main > article') as HTMLElement;
        this.mainContainer = document.querySelector('body > .container') as HTMLElement;
        this.articleHeadingElements = this.articleElement.querySelectorAll('h2,h3');
        this.outlineWrapperElement = document.querySelector('#right-menu > .wrapper > .wrapper') as HTMLElement;
        this.outlineElement = document.getElementById('outline') as HTMLElement;
        this.outlineIndicatorElement = document.getElementById('outline-indicator') as HTMLElement;
        this.outlineIndicatorSpanElement = this.outlineIndicatorElement.querySelector('span') as HTMLElement;

        this.setupOutline();
        this.outlineTitleElement = document.querySelector('#right-menu > .wrapper > .wrapper > span') as HTMLElement;

        let outlineAnchorElements = this.outlineElement.querySelectorAll('a');
        this.outlineLastAnchorElement = outlineAnchorElements[outlineAnchorElements.length - 1];

        // Initial call
        this.updateRightMenu();
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);
    }

    private onResizeListener = (): void => {
        if (this.mainContainer.style.display !== 'none') {
            this.updateRightMenu();
        }
    }

    public onScrollListener = (): void => {
        if (mediaService.mediaWidthWide() && this.mainContainer.style.display !== 'none') {
            this.setHeights();
        }
    }

    public updateRightMenu(): void {
        if (!this.validDomElementExists()) {
            return;
        }

        this.setHeights();
        this.setRightMenuDomLocation();
    }

    private setHeights(): void {
        let wrapperElement = document.querySelector('#right-menu > .wrapper');
        if (mediaService.mediaWidthWide()) {
            let top = wrapperElement.parentElement.getBoundingClientRect().top;
            let fixed = wrapperElement.classList.contains('fixed');
            // max-height placed only on ul since outline title should still be displayed

            if (top < 15) {
                this.setOutlineMaxHeight();

                if (!fixed) {
                    // See leftMenuComponent.updateLeftMenu
                    this.rightMenuElement.style.minHeight = `${this.rightMenuElement.clientHeight + 1}px`;

                    wrapperElement.classList.add('fixed');
                }
                edgeWorkaroundsService.overflowBugWorkaround(this.outlineElement);
            } else if (fixed) {
                wrapperElement.classList.remove('fixed');
                this.rightMenuElement.style.minHeight = 'initial';
                if (this.outlineElement) {
                    this.outlineElement.style.maxHeight = 'initial';
                }
                edgeWorkaroundsService.overflowBugWorkaround(this.outlineElement);
            }

            this.setOutlineActiveTopic();
        } else {
            this.rightMenuElement.style.minHeight = 'initial';
            if (this.outlineElement) {
                this.outlineElement.style.maxHeight = 'initial';
            }
            wrapperElement.classList.remove('fixed');

            this.outlineIndicatorElement.style.height = 'auto';
        }
    }

    private setRightMenuDomLocation(): void {
        let wide = mediaService.mediaWidthWide();
        let outlineInArticle = this.articleElement.querySelector('#outline') ? true : false;
        let editArticleInMetadata = this.articleElement.querySelector('#edit-article') ? true : false;

        if (!wide) {
            // Don't bother moving if outline is empty, moving messes up styles for surrounding elements
            if (this.outlineElement && !outlineInArticle) {
                $('main > article > .meta').after(this.rightMenuElement);
            }

            if (this.editArticleElement && !editArticleInMetadata) {
                document.getElementById('metadata-edit-article').appendChild(this.editArticleElement);
            }
        } else if (wide) {
            if (this.outlineElement && outlineInArticle) {
                $('body > .container').append(this.rightMenuElement);
            }

            if (this.editArticleElement && editArticleInMetadata) {
                $('#right-menu > .wrapper').prepend(this.editArticleElement);
            }
        }
    }

    private setupOutline(): void {
        let headingElements = document.querySelectorAll('main > article > h1,h2,h3');

        // Only h1
        if (headingElements.length === 1) {
            return;
        }

        let titleElement = document.querySelector('main > article > h1');
        let outlineTitle = titleElement ? titleElement.textContent : 'Outline';
        let spanElement = document.createElement('span');

        spanElement.innerHTML = outlineTitle;
        this.outlineWrapperElement.insertBefore(spanElement, this.outlineWrapperElement.children[0]);

        let listItemTree: ListItem = listItemService.generateListItemTree(headingElements,
            ['h2', 'h3'],
            document.createElement('a'),
            0);
        let ulElement = listItemService.generateMultiLevelList(listItemTree.items, '', 1);

        this.outlineElement.appendChild(ulElement);
        this.outlineAnchors = this.outlineElement.querySelectorAll('a');
    }

    private setOutlineActiveTopic(): void {
        let newActiveAnchorIndex: number;
        let minDistance = -1;

        for (let i = 0; i < this.articleHeadingElements.length; i++) {
            let headingElement = this.articleHeadingElements[i] as HTMLHeadingElement;
            let elementDistanceFromTop = Math.abs(headingElement.getBoundingClientRect().top);

            if (minDistance === -1 || elementDistanceFromTop < minDistance) {
                minDistance = elementDistanceFromTop;
                newActiveAnchorIndex = i;
            } else {
                break;
            }
        }

        if (this.activeAnchorIndex === newActiveAnchorIndex) {
            return;
        }
        this.activeAnchorIndex = newActiveAnchorIndex;

        // TODO inefficient but not easy to improve, can't cache anchor distance from top of parent since outline width can change
        // when scrollbar appears/disappears, causing wrapping.
        let outlineIndicatorBoundingRect = this.outlineIndicatorElement.getBoundingClientRect();
        let activeAnchorElement = this.outlineAnchors.item(this.activeAnchorIndex) as HTMLElement;
        let activeAnchorBoundingRect = activeAnchorElement.getBoundingClientRect();
        let lastAnchorBoundingRect = this.outlineLastAnchorElement.getBoundingClientRect();

        this.outlineIndicatorSpanElement.style.marginTop = `${activeAnchorBoundingRect.top - outlineIndicatorBoundingRect.top}px`;
        this.outlineIndicatorSpanElement.style.height = `${activeAnchorBoundingRect.height}px`;

        // Set outline height
        // TODO The outline's ul element and indicator element are siblings with a parent that has display flex row.
        // The ul element's height is set to the cross axis height of it's parent - https://bugs.chromium.org/p/chromium/issues/detail?id=134729, 
        // this is what the spec dictates. A work around is to use height: max-content, but it is not supported on edge.
        // 
        // This works around the issue, but is inefficient. It calculates the necessary height manuall. It has to be called on every resize incase the 
        // right menu scroll bar appears and causes wrapping. 
        this.outlineIndicatorElement.style.height = `${lastAnchorBoundingRect.bottom - outlineIndicatorBoundingRect.top}px`;
    }

    private setOutlineMaxHeight(): void {
        let footerHeight = window.innerHeight - document.querySelector('footer').getBoundingClientRect().top;
        let maxHeight = window.innerHeight
            - 15 // top gap 
            - 23 // bottom gap
            - this.outlineTitleElement.offsetHeight
            - (this.editArticleElement ? this.editArticleElement.offsetHeight + parseInt(getComputedStyle(this.editArticleElement).marginBottom) : 0)
            - (footerHeight < 0 ? 0 : footerHeight);

        this.outlineElement.style.maxHeight = `${maxHeight}px`;
    }
}

export default new RightMenuComponent();