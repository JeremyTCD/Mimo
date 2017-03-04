import 'js-url';
import '../node_modules/mark.js/dist/jquery.mark'; // Use relative path since mark.js has multiple dist files

class SearchBuilder {
    queryString: string;

    build(): void {
        let relHref = $("meta[property='docfx\\:rel']").attr("content");
        let searchResult = $("#search-results");

        if (typeof searchResult != 'undefined') {
            this.setupSearch();
            this.highlightKeywords();
            this.addSearchEvent();
        }
    }

    setupSearch(): void {
        let SearchWorker = require("./workers/search.worker");
        let searchWorker = new SearchWorker() as Worker;

        if (Worker && searchWorker) {
            this.setupWebWorkerSearch(searchWorker);
        } else {
            this.setupLocalSearch();
        }
    };

    setupLocalSearch(): void {
        console.log("using local search");
        let lunr = require('lunr');
        let lunrIndex = lunr(function () {
            this.ref('relPath');
            this.field('text');
        });
        lunr.tokenizer.seperator = /[\s\-\.]+/;
        let searchData = {};
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

        $("body").bind("queryReady", function () {
            let hits = lunrIndex.search(this.query);
            let results = [];
            hits.forEach(function (hit) {
                let item = searchData[hit.ref];
                results.push(item.snippetHtml);
            });
            this.handleSearchResults(results);
        });
    }

    setupWebWorkerSearch(searchWorker: Worker): void {
        console.log("using Web Worker");
        let indexReady = $.Deferred();

        searchWorker.onmessage = (event: MessageEvent) => {
            switch (event.data.e) {
                case 'index-ready':
                    indexReady.resolve();
                    break;
                case 'query-ready':
                    let hits = event.data.d;
                    this.handleSearchResults(hits);
                    break;
            }
        }

        indexReady.promise().done(() => {
            $("body").bind("queryReady", () => {
                searchWorker.postMessage({ q: this.queryString });
            });
        });
    }

    highlightKeywords() {
        let q = url('?q');
        if (q != null) {
            let keywords = q.split("%20");
            keywords.forEach((keyword: string) => {
                if (keyword !== "") {
                    $('.data-searchable *').mark(keyword);
                    $('main article *').mark(keyword);
                }
            });
        }
    }

    addSearchEvent() {
        $('body').bind("searchEvent", () => {
            $('#search-query').keypress((event: JQueryEventObject) => {
                return event.which !== 13;
            });

            $('#search-query').keyup((event: JQueryEventObject) => {
                this.queryString = $(event.target).val();
                if (this.queryString.length < 3) {
                    this.flipContents("show");
                } else {
                    this.flipContents("hide");
                    $("body").trigger("queryReady");
                    $('#search-results>.search-list').text('Search Results for "' + this.queryString + '"');
                }
            }).off("keydown");
        });
    }

    flipContents(action) {
        if (action === "show") {
            $('.hide-when-search').show();
            $('#search-results').hide();
        } else {
            $('.hide-when-search').hide();
            $('#search-results').show();
        }
    }

    handleSearchResults(hits) {
        let numPerPage = 5;
        $('#sr-pagination').empty();
        $('#sr-pagination').removeData("twbs-pagination");
        if (hits.length === 0) {
            $('#search-results > .sr-items').html('<p>No results found</p>');
        } else {
            $('#sr-pagination').twbsPagination({
                totalPages: Math.ceil(hits.length / numPerPage),
                visiblePages: 5,
                onPageClick: (event, page) => {
                    let start = (page - 1) * numPerPage;
                    let curHits = hits.slice(start, start + numPerPage);
                    $('#search-results>.sr-items').empty().append(
                        curHits
                    );
                    this.
                        queryString.
                        split(/\s+/).
                        forEach((word: string) => {
                            if (word !== '') {
                                $('#search-results>.sr-items *').mark(word);
                            }
                        });
                }
            });
        }
    }
}

export default new SearchBuilder();