import 'twbs-pagination';
import svgService from './svgService';
import Component from './component';
import paginationService from './paginationService';

class SalComponent extends Component {
    salElement: HTMLElement;
    articleListElement: HTMLElement;
    paginationParentElements: NodeList;
    itemsParentElement: HTMLElement;

    protected canInitialize(): boolean {
        this.salElement = document.getElementById('sorted-article-list');

        return this.salElement ? true : false;
    }

    protected setup(): void {
        this.articleListElement = this.salElement.querySelector('.article-list') as HTMLElement;
        this.paginationParentElements = this.salElement.querySelectorAll('.al-pagination');
        this.itemsParentElement = this.salElement.querySelector('.al-items') as HTMLElement;

        let numPerPage = 5;
        let allAlItems = this.salElement.querySelectorAll('article');

        if (allAlItems.length == 0) {
            return;
        }

        paginationService.setupPagination(
            this.articleListElement,
            this.paginationParentElements,
            this.itemsParentElement,
            allAlItems)
    }

    protected registerListeners(): void {
    }
}


export default new SalComponent();