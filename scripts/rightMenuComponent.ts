import { htmlEncode, htmlDecode } from './htmlEncodeService';
import { mediaWidthWide } from './mediaService';
import { generateMultiLevelList, generateListItemTree } from './listItemService';

import Component from './component';

class RightMenuComponent extends Component {
    rightMenuElement: HTMLElement;
    editArticleElement: HTMLElement;
    articleElement: HTMLElement;
    mainContainer: HTMLElement;

    protected canInitialize(): boolean {
        this.rightMenuElement = document.getElementById('right-menu');

        return this.rightMenuElement ? true : false;
    }

    protected setup(): void {
        this.editArticleElement = document.getElementById('edit-article');
        this.articleElement = document.querySelector('main > article') as HTMLElement;
        this.mainContainer = document.querySelector('body > .container') as HTMLElement;

        this.setRightMenuDomLocation();
        this.setupOutline();

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
        if (mediaWidthWide() && this.mainContainer.style.display !== 'none') {
            this.updateRightMenu();
        }
    }

    private updateRightMenu(): void {
        this.setRightMenuFixed();
        this.setOutlineActiveTopic();
        this.setOutlineMaxHeight();
    }

    private setRightMenuFixed(): void {
        let element = $('#right-menu > .wrapper');
        let top = element[0].parentElement.getBoundingClientRect().top;
        if (top < 23) {
            element.addClass('fixed');
            top = 23;
        } else {
            element.removeClass('fixed');
        }
    }

    private setRightMenuDomLocation(): void {
        let wide = mediaWidthWide();
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
        let headers = $('main > article > h1,h2,h3');
        if (headers.length === 0) {
            return;
        }

        let listItemTree: ListItem = generateListItemTree(headers.get(), ['h2', 'h3'], 0);
        let html = generateMultiLevelList(listItemTree.items, '', 1);
        $('#outline').append('<h5>Outline</h5>' + html);
        $('#outline a').first().addClass('active');

        // Remove bottom margin from last anchor so that decorative column does not overextend when screen
        // is narrow
        $('#outline a').
            last().
            css('margin-bottom', 0);
    }

    private setOutlineActiveTopic(): void {
        let minDistance = undefined;
        let activeAnchorIndex = undefined;
        let top = $('#right-menu > .wrapper')[0].getBoundingClientRect().top;

        // Binary search not preferable because sequence is typically short
        $('main > article').
            find('h2, h3').
            each((index: number, element: HTMLElement) => {
                let elementTop = element.getBoundingClientRect().top;
                let distance = Math.abs(elementTop - top);

                if (!minDistance || distance < minDistance) {
                    minDistance = distance;
                    activeAnchorIndex = index;
                } else {
                    return false;
                }
            });

        $('#outline a').
            removeClass('active').
            eq(activeAnchorIndex).
            addClass('active');
    }

    private setOutlineMaxHeight(): void {
        if ($('#right-menu > .wrapper').hasClass('fixed')) {
            let footerHeight = $(window).outerHeight() - $('footer')[0].getBoundingClientRect().top;
            let maxHeight = $(window).outerHeight()
                - 23 * 2 // top gap, bottom gap
                + 3
                - $('#outline > h5').outerHeight()
                - (this.editArticleElement ? this.editArticleElement.offsetHeight + parseInt(getComputedStyle(this.editArticleElement).marginBottom) : 0)
                - (footerHeight < 0 ? 0 : footerHeight);

            $('#outline > ul').css('max-height', maxHeight);
        } else {
            $('#outline > ul').css('max-height', 'initial');
        }

    }
}

export default new RightMenuComponent();