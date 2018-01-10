import searchResultsComponent from './searchResultsComponent';
import * as lunr from 'lunr';

class SearchService {
    private queryString: string;

    public setupSearch(): void {
        if (document.getElementById('search-results')) {
            let SearchWorker = require("./workers/search.worker");
            let searchWorker = new SearchWorker() as Worker;

            this.setupWebWorkerSearch(searchWorker);
        }
    };

    private setupWebWorkerSearch(searchWorker: Worker): void {
        console.log("using Web Worker");
        let indexReady = $.Deferred();

        searchWorker.onmessage = (event: MessageEvent) => {
            switch (event.data.e) {
                case 'index-ready':
                    {
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
                                this.queryString = $(event.currentTarget).val().toString();
                                if (this.queryString.length < 1) {
                                    searchResultsComponent.setShown(false);
                                } else {
                                    $("body").trigger("queryReady");
                                }
                            });

                        indexReady.resolve();
                        break;
                    }
                case 'query-ready':
                    let snippets = event.data.d;
                    searchResultsComponent.setSnippets(snippets, this.queryString);
                    break;
            }
        }

        indexReady.promise().done(() => {
            $("body").bind("queryReady", () => {
                searchWorker.postMessage({ q: this.queryString });
            });
        });
    }
}

export default new SearchService();