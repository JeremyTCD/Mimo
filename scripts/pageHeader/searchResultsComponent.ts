import { injectable, inject } from 'inversify';
import * as Mark from 'mark.js';
import Component from '../shared/component';
import PaginationService from '../shared/paginationService';
//import SectionMenuComponent from '../sectionMenu/sectionMenuComponent';
//import ArticleMenuComponent from '../articleMenu/articleMenuComponent';

@injectable()
export default class SearchResultsComponent implements Component {
    private _searchResultsElement: HTMLElement;
    private _searchResultsMessageElement: HTMLSpanElement;
    private _searchStringMessageElement: HTMLSpanElement;
    private _articleListElement: HTMLElement;
    private _paginationParentElements: NodeList;
    private _articleListItemsParentElement: HTMLElement;
    //private _sectionMenuComponent: SectionMenuComponent;
    //private _articleMenuComponent: ArticleMenuComponent;
    private _paginationService: PaginationService;

    public constructor(
        //sectionMenuComponent: SectionMenuComponent,
        //articleMenuComponent: ArticleMenuComponent,
        paginationService: PaginationService) {
        //this._sectionMenuComponent = sectionMenuComponent;
        //this._articleMenuComponent = articleMenuComponent;
        this._paginationService = paginationService;
    }

    public setupImmediate(): void {
        // Do nothing
    }

    public setupOnDomContentLoaded(): void {
        this._searchResultsElement = document.getElementById('search-results');
        this._searchStringMessageElement = document.querySelector('#search-string > span') as HTMLSpanElement;
        this._searchResultsMessageElement = document.querySelector('#search-results > span') as HTMLSpanElement;
        this._articleListElement = this._searchResultsElement.querySelector('.article-list') as HTMLElement;
        this._paginationParentElements = this._searchResultsElement.querySelectorAll('.al-pagination');
        this._articleListItemsParentElement = this._searchResultsElement.querySelector('.al-items') as HTMLElement;
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    public registerListeners(): void {
    }

    public setShown(shown: boolean) {
        if (shown) {
            document.getElementById('search-results').style.display = 'flex';
        } else {
            document.getElementById('search-results').style.display = 'none';

            // Reset
            this._articleListItemsParentElement.innerHTML = '';
            $(this._paginationParentElements).twbsPagination('destroy');

            // While search results are displayed, main container (including left and right menu) have their dispay set to none.
            // This means that left and right menu cannot be updated on resize/scroll since they rely on getBoundingClientRect
            // which is meaningles when they are not displayed. Therefore, just before re-displaying main container, left and 
            // right menu must be updated. 
            //this._sectionMenuComponent.updateSectionMenu();
            //this._articleMenuComponent.updateArticleMenu();
        }
    }

    public setSnippets = (snippets: string[], queryString: string): void => {
        let numPerPage = 5;

        $(this._paginationParentElements).twbsPagination('destroy');

        if (snippets.length === 0) {
            // Hide article list
            this._articleListElement.style.display = 'none';

            // Update search string message
            this._searchStringMessageElement.textContent = `No results found for "${queryString}" ...`;

            // Show and update results message
            this._searchResultsMessageElement.style.display = 'flex';
            this._searchResultsMessageElement.textContent = `Your search - "${queryString}" - did not match any articles`;
        } else {
            // Update search string message
            this._searchStringMessageElement.textContent = `Search results for "${queryString}" ...`;

            // Hide results message
            this._searchResultsMessageElement.style.display = 'none';

            // Show and update article list
            this._articleListElement.style.display = 'flex';
            this._paginationService.setupPagination(
                this._articleListElement,
                this._paginationParentElements,
                this._articleListItemsParentElement,
                snippets,
                () => {
                    let marked: string[] = [];

                    queryString.
                        split(/\s+/).
                        forEach((word: string) => {
                            if (word !== '' && marked.indexOf(word) === -1) {
                                var target = new Mark(this._articleListItemsParentElement);
                                target.mark(word);
                                marked.push(word);
                            }
                        });
                })
        }

        this.setShown(true);
    }
}