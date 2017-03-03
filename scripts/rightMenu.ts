import { htmlEncode, htmlDecode, generateMultiLevelList, ListItem, generateListItemTree } from './utils';

class RightMenuBuilder {
    public initialize(): void {
        this.setup();
        this.registerListeners();
    }

    private setup(): void {
        this.rightMenuResizeListener();
        this.setupOutline();
    }

    private registerListeners(): void {
        $(window).scroll((event: JQueryEventObject) => {
            this.rightMenuScrollListener();
            this.outlineScrollAndResizeListener();
        });

        $(window).resize((event: JQueryEventObject) => {
            this.rightMenuResizeListener();
            this.outlineScrollAndResizeListener();
        });
    }

    private rightMenuScrollListener() {
        if (window.matchMedia('(min-width: 1025px)').matches) {
            let element = $('#right-menu > .wrapper');
            let top = element[0].parentElement.getBoundingClientRect().top;
            if (top < 23) {
                element.addClass('fixed');
                top = 23;
            } else {
                element.removeClass('fixed');
            }
        }
    }

    private rightMenuResizeListener() {
        let wide = window.matchMedia('(min-width: 1025px)').matches;
        let rightMenuInArticle = $('article > #right-menu').length === 1;

        if (!wide && !rightMenuInArticle) {
            $('article > .meta').after($('#right-menu'));
        } else if (wide && rightMenuInArticle) {
            $('#main > .container').append($('#right-menu'));
        }
    }

    private setupOutline() {
        let listItemTree: ListItem = generateListItemTree($('article > h1,h2,h3').get(), ['h2', 'h3'], 0);
        let html = generateMultiLevelList(listItemTree.items, '', 1);
         $("#outline").append('<h5>Outline</h5>' + html);
        $('#outline a').first().addClass('active');
    }

    private outlineScrollAndResizeListener() {
        if (window.matchMedia('(min-width: 1025px)')) {
            let minDistance = undefined;
            let activeAnchorIndex = undefined;
            let top = $('#right-menu > .wrapper')[0].getBoundingClientRect().top;

            // Binary search not preferable because sequence is typically short
            $('article').
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

            if ($('#right-menu > .wrapper').hasClass('fixed')) {
                this.setOutlineMaxHeight();
            } else {
                $('#outline > ul').css('max-height', 'initial');
            }
        }
    }

    private setOutlineMaxHeight(): void {
        let footerHeight = $(window).outerHeight() - $('footer')[0].getBoundingClientRect().top;
        let maxHeight = $(window).outerHeight()
            - 23 * 2
            + 3
            - $('#outline > h5').outerHeight()
            - $('#edit-article').outerHeight()
            - (footerHeight < 0 ? 0 : footerHeight);

        $('#outline > ul').
            css('max-height', maxHeight);
    }
}

export default new RightMenuBuilder();