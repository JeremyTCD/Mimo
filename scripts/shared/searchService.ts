import { injectable } from 'inversify';
import SearchResultsComponent from '../pageHeader/searchResultsComponent';
import SearchWorker = require('worker-loader?inline=true&fallback=false!../workers/search.worker');
import SearchData from './searchData';

@injectable()
export default class SearchService {
    private _searchResultsComponent: SearchResultsComponent;

    private _queryString: string;

    public constructor(searchResultsComponent: SearchResultsComponent) {
        this._searchResultsComponent = searchResultsComponent;
    }

    public setupSearch(): void {
        let searchWorker = new SearchWorker() as Worker;

        this.setupWebWorkerSearch(searchWorker);
    };

    private setupWebWorkerSearch(searchWorker: Worker): void {
        console.log("using Web Worker");

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

                // TODO allow query string to perform search on page load
                let searchInputElement = document.getElementById('search-query');

                searchInputElement.
                    addEventListener('keypress', (event: KeyboardEvent) => {
                        // By default, browsers attempt to submit form if enter is pressed
                        if (event.key === 'Enter') {
                            event.preventDefault();
                        }
                    });

                searchInputElement.
                    addEventListener('keyup', (event: KeyboardEvent) => {
                        this._queryString = (event.currentTarget as HTMLInputElement).value;
                        if (this._queryString.length < 1) {
                            this._searchResultsComponent.setShown(false);
                        } else {
                            // By the time we add this event listener to the search input element,
                            // the search worker is already ready to receive messages.
                            searchWorker.postMessage({ eventType: 'query', payload: this._queryString });
                        }
                    });
            }
        }
        searchDataRequest.send();

        // Generate base URL
        var tempA = document.createElement('a');
        tempA.setAttribute('href', indexRelPath + '/../..'); // Index file is located in <base URL>/resources folder, go two levels up to get to base URL
        let baseUrl = tempA.href;
        baseUrl = baseUrl.substring(0, baseUrl.length - 1); // Drop trailing /

        // Setup listener for query results
        let documentFragments: { [ref: string]: DocumentFragment } = {};
        searchWorker.onmessage = (event: MessageEvent) => {
            let items: SearchData[] = event.data.payload;
            let result: DocumentFragment[] = [];

            for (let i = 0; i < items.length; i++) {
                let item: SearchData = items[i];
                let documentFragment = documentFragments[item.relPath];

                if (!documentFragment) {
                    documentFragment = document.createRange().createContextualFragment(item.snippetHtml);

                    // Since index.json is shared by all pages, urls within it are specified as absolute paths (e.g /resources/image.svg).
                    // We need to make these urls absolute for them to work even when the website is published to a path, e.g jering.tech/utilities/<project name>.
                    documentFragment.querySelectorAll('*[href^="/"]').forEach((element: Element) => {
                        element.setAttribute('href', baseUrl + element.getAttribute('href'));
                    })
                    documentFragment.querySelectorAll('*[src^="/"]').forEach((element: Element) => {
                        element.setAttribute('src', baseUrl + element.getAttribute('src'));
                    })
                }

                result.push(documentFragment);
            }

            this._searchResultsComponent.setDocumentFragments(result, this._queryString);
        }
    }
}
