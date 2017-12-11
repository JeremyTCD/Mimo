import * as lunr from 'lunr';

(function () {
    let lunrBuilder = new lunr.Builder();

    // Setup documents
    lunrBuilder.ref('relPath');
    lunrBuilder.field('title');
    lunrBuilder.field('text');

    // TODO - https://github.com/olivernn/lunr.js/issues/323
    // lunr.tokenizer.separator = /[\s\-\.]+/;

    // Get search data
    let searchData = {};
    let searchDataRequest = new XMLHttpRequest();
    searchDataRequest.open('GET', '/index.json');
    searchDataRequest.onload = function () {
        if (searchDataRequest.status != 200) {
            return;
        }
        searchData = JSON.parse(searchDataRequest.responseText);
        for (let prop in searchData) {
            lunrBuilder.add(searchData[prop]);
        }
        postMessage({ e: 'index-ready' });
    }
    searchDataRequest.send();

    let lunrIndex: lunr.Index;
    onmessage = function (event: MessageEvent) {
        // Most visitors don't use search. Only build index if absolutely necessary.
        if (!lunrIndex) {
            lunrIndex = lunrBuilder.build();
        }

        let queryString = event.data.q;
        // Multi-word, partial-word, fuzzy search
        let hits = lunrIndex.query(q => {
            lunr.tokenizer(queryString).forEach(function (token) {
                let subQueryString = token.toString();

                q.term(subQueryString, { fields: ['title'], usePipeline: true, boost: 200 })
                // Start and end wild cards, e.g "correct" will match with "rre". Note that wildcard query strings are not passed 
                // through the search pipeline since they are hard to stem.
                q.term("*" + subQueryString + "*", { fields: ['title'], usePipeline: true, boost: 100 })
                // Fuzzy maching, e.g "correct" will match with search term "correcc"
                q.term(subQueryString, { fields: ['title'], usePipeline: true, editDistance: 1 })

                q.term(subQueryString, { fields: ['text'], usePipeline: true, boost: 20 })
                q.term("*" + subQueryString + "*", { fields: ['text'], usePipeline: true, boost: 10 })
                q.term(subQueryString, { fields: ['text'], usePipeline: true, editDistance: 1 })
            })
        });
        let results = [];
        hits.forEach(function (hit) {
            let item = searchData[hit.ref];
            results.push(item.snippetHtml);
        });
        postMessage({ e: 'query-ready', q: queryString, d: results });
    }
})();
