import '../node_modules/mark.js/dist/jquery.mark'; // Use relative path since mark.js has multiple dist files

import searchResultsComponent from './searchResultsComponent';

class SearchService {
    private queryString: string;

    public setupSearch(): void {
        if ($("#search-results").length === 1) {
            let SearchWorker = require("./workers/search.worker");
            let searchWorker = new SearchWorker() as Worker;

            if (Worker && searchWorker) {
                this.setupWebWorkerSearch(searchWorker);
            } else {
                this.setupLocalSearch();
            }

            this.addSearchEvent();
        }
    };

    private setupLocalSearch(): void {
        console.log("using local search");
        let lunr = require('lunr');
        let lunrIndex = lunr(function () {
            this.ref('relPath');
            this.field('title', { boost: 50 });
            this.field('text', { boost: 20 });
        });
        lunr.tokenizer.seperator = /[\s\-\.]+/;
        let searchData: { [key: string]: SearchData } = {};
        let searchDataRequest = new XMLHttpRequest();

        let indexPath = "/index.json";
        if (indexPath) {
            searchDataRequest.open('GET', indexPath);
            searchDataRequest.onload = function () {
                if (searchDataRequest.status != 200) {
                    return;
                }
                searchData = JSON.parse(searchDataRequest.responseText);
                for (let prop in searchData) {
                    lunrIndex.add(searchData[prop]);
                }
            }
            searchDataRequest.send();
        }

        $("body").bind("queryReady", () => {
            let hits = lunrIndex.search(this.queryString);
            let snippets: string[] = [];
            hits.
                forEach((hit: any) => {
                    let data: SearchData = searchData[hit.ref];
                    snippets.push(data.snippetHtml);
                });
            searchResultsComponent.setSnippets(snippets, this.queryString, this.queryString);
        });
    }

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
                    let highlightString = event.data.q;
                    searchResultsComponent.setSnippets(snippets, highlightString, this.queryString);
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
                    if (this.queryString.length < 3) {
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