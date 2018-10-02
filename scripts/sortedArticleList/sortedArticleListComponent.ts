import { injectable } from 'inversify';
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
        let buttonsParentElement = this._sortedArticleListElement.querySelector('.pagination-buttons') as HTMLUListElement;
        let itemsParentElement = this._sortedArticleListElement.querySelector('.al-items') as HTMLElement;

        let allAlItems = this._sortedArticleListElement.querySelectorAll('article');

        if (allAlItems.length == 0) {
            return;
        }

        this._paginationService.setupPagination(
            buttonsParentElement,
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
