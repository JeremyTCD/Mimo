import '../node_modules/mark.js/dist/jquery.mark'; // Use relative path since mark.js has multiple dist files

import searchResultsComponent from './searchResultsComponent';
import * as lunr from 'lunr';

class SearchService {
    private queryString: string;

    public setupSearch(): void {
        if (document.getElementById('search-results')) {
            let SearchWorker = require("./workers/search.worker");
            let searchWorker = new SearchWorker() as Worker;

            this.setupWebWorkerSearch(searchWorker);
            this.addSearchEvent();
        }
    };

    private setupWebWorkerSearch(searchWorker: Worker): void {
        console.log("using Web Worker");
        let indexReady = $.Deferred();

        searchWorker.onmessage = (event: MessageEvent) => {
            switch (event.data.e) {
                case 'index-ready':
                    indexReady.resolve();
                    break;
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

    private addSearchEvent() {
        $('body').bind("searchEvent", () => {
            $('#search-query').
                keypress((event: JQuery.Event) => {
                    return event.which !== 13;
                });

            $('#search-query').
                keyup((event: JQuery.Event) => {
                    this.queryString = $(event.target).val().toString();
                    if (this.queryString.length < 1) {
                        searchResultsComponent.setShown(false);
                    } else {
                        $("body").trigger("queryReady");
                    }
                }).
                off("keydown");
        });
    }
}

export default new SearchService();