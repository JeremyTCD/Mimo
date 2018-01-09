import 'twbs-pagination';
import SvgService from './svgService';
import Component from './component';
import paginationService from './paginationService';

class SalComponent extends Component {
    salElement: HTMLElement;
    paginationParentElement: HTMLElement;
    itemsParentElement: HTMLElement;

    protected canInitialize(): boolean {
        this.salElement = document.getElementById('sorted-article-list');

        return this.salElement ? true : false;
    }

    protected setup(): void {
        this.paginationParentElement = this.salElement.querySelector('.al-pagination') as HTMLElement;
        this.itemsParentElement = this.salElement.querySelector('.al-items') as HTMLElement;

        let numPerPage = 5;
        let allAlItems = this.salElement.querySelectorAll('article');

        if (allAlItems.length == 0) {
            return;
        }

        paginationService.setupPagination(
            this.paginationParentElement,
            this.itemsParentElement,
            allAlItems)
    }

    protected registerListeners(): void {
    }
}


export default new SalComponent();