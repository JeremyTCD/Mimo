import mediaService from './mediaService';
import listItemService from './listItemService';
import edgeWorkaroundsService from './edgeWorkaroundsService';
import Component from './component';

class RightMenuComponent extends Component {
    rightMenuElement: HTMLElement;
    editArticleElement: HTMLElement;
    articleElement: HTMLElement;
    mainContainer: HTMLElement;
    articleHeadingElements: NodeList;
    outlineUlElement: HTMLElement;

    protected canInitialize(): boolean {
        this.rightMenuElement = document.getElementById('right-menu');

        return this.rightMenuElement ? true : false;
    }

    protected setup(): void {
        this.editArticleElement = document.getElementById('edit-article');
        this.articleElement = document.querySelector('main > article') as HTMLElement;
        this.mainContainer = document.querySelector('body > .container') as HTMLElement;
        this.articleHeadingElements = this.articleElement.querySelectorAll('h2,h3,h4');

        this.setRightMenuDomLocation();
        this.setupOutline();
        this.outlineUlElement = document.querySelector('#outline > ul') as HTMLUListElement;

        // Initial call
        this.updateRightMenu();
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);
    }

    public onResizeListener = (): void => {
        if (this.mainContainer.style.display !== 'none') {
            this.setRightMenuDomLocation();
            this.updateRightMenu();
        }
    }

    public onScrollListener = (): void => {
        if (mediaService.mediaWidthWide() && this.mainContainer.style.display !== 'none') {
            this.updateRightMenu();
        }
    }

    public updateRightMenu(): void {
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
                edgeWorkaroundsService.overflowBugWorkaround(this.outlineUlElement);
            } else if (fixed) {
                wrapperElement.classList.remove('fixed');
                this.rightMenuElement.style.minHeight = 'initial';
                this.outlineUlElement.style.maxHeight = 'initial';
                edgeWorkaroundsService.overflowBugWorkaround(this.outlineUlElement);
            }
            this.setOutlineActiveTopic();
        } else {
            this.rightMenuElement.style.minHeight = 'initial';
            this.outlineUlElement.style.maxHeight = 'initial';
            wrapperElement.classList.remove('fixed');
        }
    }

    public setRightMenuDomLocation(): void {
        let wide = mediaService.mediaWidthWide();
        let rightMenuInArticle = this.articleElement.querySelector('#right-menu');

        if (!wide && !rightMenuInArticle) {
            $('main > article > .meta').after(this.rightMenuElement);

            if (this.editArticleElement) {
                document.getElementById('metadata-edit-article').appendChild(this.editArticleElement);
            }
        } else if (wide && rightMenuInArticle) {
            $('body > .container').append(this.rightMenuElement);

            if (this.editArticleElement) {
                $('#right-menu > .wrapper').prepend(this.editArticleElement);
            }
        }
    }

    private setupOutline(): void {
        let headingElements = document.querySelectorAll('main > article > h1,h2,h3,h4');
        if (headingElements.length === 0) {
            return;
        }

        let titleElement = document.querySelector('main > article > h1');
        let outlineTitle = titleElement ? titleElement.textContent : 'Outline';

        let listItemTree: ListItem = listItemService.generateListItemTree(headingElements,
            ['h2', 'h3', 'h4'],
            document.createElement('a'),
            0);
        let ulElement = listItemService.generateMultiLevelList(listItemTree.items, '', 1);
        let outlineElement = document.getElementById('outline');
        let spanElement = document.createElement('span');

        spanElement.innerHTML = outlineTitle;
        outlineElement.appendChild(spanElement);
        outlineElement.appendChild(ulElement);
        $('#outline a').first().addClass('active');

        // Remove bottom margin from last anchor so that decorative column does not overextend when screen
        // is narrow
        $('#outline a').
            last().
            css('margin-bottom', 0);
    }

    private setOutlineActiveTopic(): void {
        let activeAnchorIndex = undefined;
        let minDistance = -1;

        for (let i = 0; i < this.articleHeadingElements.length; i++) {
            let headingElement = this.articleHeadingElements[i] as HTMLHeadingElement;
            let elementDistanceFromTop = Math.abs(headingElement.getBoundingClientRect().top);

            if (minDistance === -1 || elementDistanceFromTop < minDistance) {
                minDistance = elementDistanceFromTop;
                activeAnchorIndex = i;
            } else {
                break;
            }
        }

        let oldActiveAnchorElement = document.querySelector('#outline a.active');
        if (oldActiveAnchorElement) {
            oldActiveAnchorElement.classList.remove('active');
        }

        let newActiveAnchorElement = document.querySelectorAll('#outline a').item(activeAnchorIndex);
        if (newActiveAnchorElement) {
            newActiveAnchorElement.classList.add('active');
        }
    }

    private setOutlineMaxHeight(): void {
        let footerHeight = window.innerHeight - document.querySelector('footer').getBoundingClientRect().top;
        let maxHeight = window.innerHeight
            - 15 // top gap 
            - 23 // bottom gap
            - (document.querySelector('#outline > span') as HTMLSpanElement).offsetHeight
            - (this.editArticleElement ? this.editArticleElement.offsetHeight + parseInt(getComputedStyle(this.editArticleElement).marginBottom) : 0)
            - (footerHeight < 0 ? 0 : footerHeight);

        this.outlineUlElement.style.maxHeight = `${maxHeight}px`;
    }
}

export default new RightMenuComponent();