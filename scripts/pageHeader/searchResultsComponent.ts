import { injectable, inject } from 'inversify';
import * as Mark from 'mark.js';
import Component from '../shared/component';
import PaginationService from '../shared/paginationService';
import OverlayService from '../shared/overlayService';
import MediaService from '../shared/mediaService';
//import SectionMenuComponent from '../sectionMenu/sectionMenuComponent';
//import ArticleMenuComponent from '../articleMenu/articleMenuComponent';

@injectable()
export default class SearchResultsComponent implements Component {
    private _searchResultsElement: HTMLElement;
    private _searchResultsMessageElement: HTMLSpanElement;
    private _searchStringMessageElement: HTMLSpanElement;
    private _articleListElement: HTMLElement;
    private _paginationParentElements: NodeList;
    private _pageHeaderElement: HTMLElement;
    private _articleListItemsParentElement: HTMLElement;
    //private _sectionMenuComponent: SectionMenuComponent;
    //private _articleMenuComponent: ArticleMenuComponent;
    private _paginationService: PaginationService;
    private _overlayService: OverlayService;
    private _mediaService: MediaService;

    public constructor(
        //sectionMenuComponent: SectionMenuComponent,
        //articleMenuComponent: ArticleMenuComponent,
        mediaService: MediaService,
        overlayService: OverlayService,
        paginationService: PaginationService) {
        //this._sectionMenuComponent = sectionMenuComponent;
        //this._articleMenuComponent = articleMenuComponent;
        this._paginationService = paginationService;
        this._mediaService = mediaService;
        this._overlayService = overlayService;
    }

    public setupImmediate(): void {
        // Do nothing
    }

    public setupOnDomContentLoaded(): void {
        this._pageHeaderElement = document.getElementById('page-header');
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

    public setShown(shown: boolean) {
        if (shown) {
            this._searchResultsElement.style.display = 'flex';

            if (!this._mediaService.mediaWidthNarrow()) {
                this._overlayService.activateOverlay(this._pageHeaderElement, false, false);
            }
        } else {
            this._searchResultsElement.style.display = 'none';

            // Reset
            this._articleListItemsParentElement.innerHTML = '';
            $(this._paginationParentElements).twbsPagination('destroy');

            if (!this._mediaService.mediaWidthNarrow()) {
                this._overlayService.deactivateOverlay(false);
            }

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