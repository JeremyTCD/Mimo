import { htmlEncode, htmlDecode } from './htmlEncodeService';
import { mediaWidthWide } from './mediaService';
import { generateMultiLevelList, generateListItemTree } from './listItemService';
import ListItem from './listItem';
import Component from './component';

class RightMenuComponent extends Component {
    protected canInitialize(): boolean {
        return $('#right-menu').length === 1;
    }

    protected setup(): void {
        this.setRightMenuDomLocation();
        this.setupOutline();
    }

    protected registerListeners(): void {
        $(window).scroll((event: JQueryEventObject) => {
            if (mediaWidthWide() && $('main').css('display') !== 'none') {
                this.setRightMenuFixed();

                this.setOutlineActiveTopic();
                this.setOutlineMaxHeight();
            }
        });
        $(window).resize((event: JQueryEventObject) => {
            if ($('main').css('display') !== 'none') {
                this.setRightMenuDomLocation();
                this.setRightMenuFixed();

                this.setOutlineActiveTopic();
                this.setOutlineMaxHeight();
            }
        });
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
        let rightMenuInArticle = $('main article > #right-menu').length === 1;

        if (!wide && !rightMenuInArticle) {
            $('main article > .meta').
                after($('#right-menu')).
                find('ul > li:last-child').
                append($('#edit-article'));
        } else if (wide && rightMenuInArticle) {
            $('body > .container').append($('#right-menu'));
            $('#right-menu > .wrapper').prepend($('#edit-article'));
        }
    }

    private setupOutline(): void {
        let headers = $('main #main-article > h1,h2,h3');
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
        $('main article').
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
                - 23 * 2
                + 3
                - $('#outline > h5').outerHeight()
                - $('#edit-article').outerHeight()
                - (footerHeight < 0 ? 0 : footerHeight);

            $('#outline > ul').
                css('max-height', maxHeight);
        } else {
            $('#outline > ul').css('max-height', 'initial');
        }

    }
}

export default new RightMenuComponent();