import 'twbs-pagination';
import SvgService from './svgService';
import Component from './component';

class SalComponent extends Component {
    salElement: HTMLElement;

    protected canInitialize(): boolean {
        this.salElement = document.getElementById('sorted-article-list');

        return this.salElement ? true : false;
    }

    protected setup(): void {
        let numPerPage = 1;
        let allAlItems = $('#sal-all-items > article');

        if (allAlItems.length == 0) {
            return;
        }

        $('#sorted-article-list > .article-list > .al-pagination').twbsPagination({
            totalPages: Math.ceil(allAlItems.length / numPerPage),
            visiblePages: 3,
            first: ' ',
            prev: ' ',
            next: ' ',
            last: ' ',
            onPageClick: (event: any, page: number) => {
                let start = (page - 1) * numPerPage;
                let currentAlItems = allAlItems.slice(start, start + numPerPage);
                $('#sorted-article-list > .article-list > .al-items').empty().append(currentAlItems);

                this.
                    salElement.
                    querySelector('.al-pagination .first > a').
                    appendChild(SvgService.createSvgExternalSpriteElement('material-design-first-page'));

                this.
                    salElement.
                    querySelector('.al-pagination .prev > a').
                    appendChild(SvgService.createSvgExternalSpriteElement('material-design-previous-page'));

                this.
                    salElement.
                    querySelector('.al-pagination .next > a').
                    appendChild(SvgService.createSvgExternalSpriteElement('material-design-next-page'));

                this.
                    salElement.
                    querySelector('.al-pagination .last > a').
                    appendChild(SvgService.createSvgExternalSpriteElement('material-design-last-page'));
            }
        });
    }

    protected registerListeners(): void {
    }
}


export default new SalComponent();