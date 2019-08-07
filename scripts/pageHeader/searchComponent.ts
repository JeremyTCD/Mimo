import { injectable } from 'inversify';
import Component from '../shared/component';
import SearchWorker = require('worker-loader?inline=true&fallback=false!../workers/search.worker');
import SearchData from '../shared/searchData';
import TextInputFactory from '../shared/textInputFactory';
import OverlayService from '../shared/overlayService';
import PaginationFactory from '../shared/paginationFactory';
import Pagination from '../shared/pagination';
import * as Mark from 'mark.js';
import TextInput from '../shared/textInput';

@injectable()
export default class SearchComponent implements Component {
    private static readonly PAGE_HEADER_SEARCH_RESULTS_EXPANDED_CLASS: string = 'page-header--search-results-expanded';
    private static readonly PAGE_HEADER_SEARCH_RESULTS_COLLAPSING_CLASS: string = 'page-header--search-results-collapsing';
    private static readonly SEARCH_RESULTS_EXPANDED_CLASS: string = 'search__results--expanded';

    private _searchResultsElement: HTMLElement;
    private _searchStringTextElement: HTMLElement;
    private _noMatchesTextElement: HTMLElement;
    private _paginationElement: HTMLElement;

    private _overlayActivationID: number;
    private _searchResultsExpanded: boolean;
    private _pagination: Pagination;
    private _textInput: TextInput;
    private _pageHeaderElementClassList: DOMTokenList;
    private _searchResultsElementClassList: DOMTokenList;

    public constructor(private _textInputFactory: TextInputFactory,
        private _paginationFactory: PaginationFactory,
        private _overlayService: OverlayService) {
    }

    public enabled(): boolean {
        if (this._searchResultsElement === undefined) {
            this._searchResultsElement = document.querySelector('.search__results');
        }

        return this._searchResultsElement ? true : false;
    }

    public setupOnDomInteractive(): void {
        this._pageHeaderElementClassList = document.querySelector('.page-header').classList; // Need to change page header's z-index when search is expanded
        this._searchResultsElementClassList = this._searchResultsElement.classList;
        this._paginationElement = this._searchResultsElement.querySelector('.pagination');
        this._searchStringTextElement = this._searchResultsElement.querySelector('.search__query-string');
        this._noMatchesTextElement = this._searchResultsElement.querySelector('.search__no-matches');
        this._searchResultsExpanded = false;

        this._pagination = this._paginationFactory.build(this._paginationElement, 5, 5, this.paginationOnRenderPage);

        // Setup search worker
        let searchWorker = new SearchWorker() as Worker;

        // Get index.json url
        let linkElement = document.querySelector('head > link[href*="/index."]');
        let indexRelPath = linkElement.getAttribute('href');

        // Get search data
        let searchDataRequest = new XMLHttpRequest();
        searchDataRequest.open('GET', indexRelPath);
        searchDataRequest.onload = () => {
            // If no index.json is found, just leave the index empty
            if (searchDataRequest.status === 200) {
                searchWorker.postMessage({
                    eventType: 'search-data-received',
                    payload: searchDataRequest.responseText
                });
            }
        }
        searchDataRequest.send();

        // Generate base URL
        var tempAElement = document.createElement('a');
        tempAElement.setAttribute('href', indexRelPath + '/../..'); // Index file is located in <base URL>/resources folder, go two levels up to get to base URL
        let baseUrl = tempAElement.href;
        baseUrl = baseUrl.substring(0, baseUrl.length - 1); // Drop trailing /

        // Setup listener for query results
        let articleElements: { [ref: string]: HTMLElement } = {};
        searchWorker.onmessage = (event: MessageEvent) => {
            let items: SearchData[] = event.data.results;
            let resultsElements: HTMLElement[] = [];

            for (let i = 0; i < items.length; i++) {
                let item: SearchData = items[i];
                let articleElement = articleElements[item.relPath];

                if (!articleElement) {
                    articleElement = document.createRange().createContextualFragment(item.snippetHtml).firstChild as HTMLElement;

                    // Since index.json is shared by all pages, urls within it are specified as absolute paths (e.g /resources/image.svg).
                    // We need to make these urls absolute for them to work even when the website is published to a path, e.g jering.tech/utilities/<project name>.
                    articleElement.querySelectorAll('*[href^="/"]').forEach((element: Element) => {
                        element.setAttribute('href', baseUrl + element.getAttribute('href'));
                    })
                    articleElement.querySelectorAll('*[src^="/"]').forEach((element: Element) => {
                        element.setAttribute('src', baseUrl + element.getAttribute('src'));
                    })
                }

                resultsElements.push(articleElement);
            }

            this.showSearchResults(resultsElements);
        }

        // Create text input
        this._textInput = this._textInputFactory.build(document.querySelector('.search__box'),
            (value: string) => {
                if (value.length < 1) {
                    this.collapseSearchResults();
                } else {
                    searchWorker.postMessage({ eventType: 'query', queryString: value });
                }
            },
            () => this.collapseSearchResults());
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    public collapseResults(): void {
        this._textInput.reset();
    }

    private collapseSearchResults() {
        if (!this._searchResultsExpanded) {
            return;
        }

        this._pageHeaderElementClassList.remove(SearchComponent.PAGE_HEADER_SEARCH_RESULTS_EXPANDED_CLASS);
        this._searchResultsElementClassList.remove(SearchComponent.SEARCH_RESULTS_EXPANDED_CLASS);
        this._pageHeaderElementClassList.add(SearchComponent.PAGE_HEADER_SEARCH_RESULTS_COLLAPSING_CLASS);
        this._searchResultsElement.addEventListener('transitionend', this.onHiddenListener, true);

        this._overlayService.deactivateOverlay(this._overlayActivationID);

        this._searchResultsExpanded = false;
    }

    private expandSearchResults() {
        if (this._searchResultsExpanded) {
            return;
        }

        // Expand search results
        this._pageHeaderElementClassList.add(SearchComponent.PAGE_HEADER_SEARCH_RESULTS_EXPANDED_CLASS);
        this._searchResultsElementClassList.add(SearchComponent.SEARCH_RESULTS_EXPANDED_CLASS);

        this._overlayActivationID = this._overlayService.activateOverlay(this.overlayOnClick, true, false);

        this._searchResultsExpanded = true;
    }

    private paginationOnRenderPage = (rootElement: HTMLElement) => {
        let marked: string[] = [];

        this._textInput.value().
            split(/\s+/).
            forEach((word: string) => {
                if (word !== '' && marked.indexOf(word) === -1) {
                    var target = new Mark(rootElement);
                    target.mark(word);
                    marked.push(word);
                }
            });
    }

    private showSearchResults(resultElements: HTMLElement[]) {
        if (resultElements.length === 0) {
            // Hide pagination
            this._paginationElement.style.display = 'none';

            // Update search string message
            this._searchStringTextElement.textContent = `No results found for "${this._textInput.value()}" ...`;

            // Show and update results message
            this._noMatchesTextElement.style.display = '';
            this._noMatchesTextElement.textContent = `Your query - "${this._textInput.value()}" - has no matches`;
        } else {
            // Update search string message
            this._searchStringTextElement.textContent = `Search results for "${this._textInput.value()}" ...`;

            // Hide results message
            this._noMatchesTextElement.style.display = 'none';

            // Show and update pagination
            this._paginationElement.style.display = '';

            this._pagination.setItems(resultElements);
        }

        this.expandSearchResults();
    }

    private onHiddenListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            this._searchResultsElement.removeEventListener('transitionend', this.onHiddenListener, true);
            this._pageHeaderElementClassList.remove(SearchComponent.PAGE_HEADER_SEARCH_RESULTS_COLLAPSING_CLASS);
            event.stopPropagation();
        }
    }

    private overlayOnClick = (): void => {
        this._textInput.reset();
    }

    public isExpanded() {
        return this._pageHeaderElementClassList.contains(SearchComponent.PAGE_HEADER_SEARCH_RESULTS_EXPANDED_CLASS);
    }

    public isCollapsing() {
        return this._pageHeaderElementClassList.contains(SearchComponent.PAGE_HEADER_SEARCH_RESULTS_COLLAPSING_CLASS);
    }

    public isCollapsed() {
        return !this.isExpanded() && !this.isCollapsing();
    }
}
