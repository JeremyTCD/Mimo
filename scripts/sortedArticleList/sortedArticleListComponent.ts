import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import PaginationService from '../shared/paginationService';

@injectable()
export default class SalComponent extends RootComponent {
    private _sortedArticleListElement: HTMLElement;
    private _paginationService: PaginationService;

    public constructor(paginationService: PaginationService) {
        super();
        this._paginationService = paginationService;
    }

    public setupImmediate(): void {
        this._sortedArticleListElement = document.getElementById('sorted-article-list');
    }

    public enabled(): boolean {
        return this._sortedArticleListElement ? true : false;
    }

    public setupOnDomContentLoaded(): void {
        let articleListElement = this._sortedArticleListElement.querySelector('.article-list') as HTMLElement;
        let paginationParentElements = this._sortedArticleListElement.querySelectorAll('.al-pagination');
        let itemsParentElement = this._sortedArticleListElement.querySelector('.al-items') as HTMLElement;

        let numPerPage = 5;
        let allAlItems = this._sortedArticleListElement.querySelectorAll('article');

        if (allAlItems.length == 0) {
            return;
        }

        this._paginationService.setupPagination(
            articleListElement,
            paginationParentElements,
            itemsParentElement,
            allAlItems)
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    public registerListeners(): void {
        // Do nothing
    }
}
