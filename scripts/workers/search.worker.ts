import * as lunr from 'lunr';

let lunrBuilder = new lunr.Builder();
// Setup documents
lunrBuilder.ref('relPath');
lunrBuilder.field('title');
lunrBuilder.field('text');

// TODO - https://github.com/olivernn/lunr.js/issues/323
// lunr.tokenizer.separator = /[\s\-\.]+/;

let lunrIndex: lunr.Index;
let searchData = null;

onmessage = function (event: MessageEvent) {
    switch (event.data.eventType) {
        case 'search-data-received':
            {
                // Build builder
                searchData = JSON.parse(event.data.payload);
                for (let prop in searchData) {
                    lunrBuilder.add(searchData[prop]);
                }

                break;
            }
        case 'query':
            {
                if (!searchData) {
                    return;
                }

                // Generate the index on demand
                if (!lunrIndex) {
                    lunrIndex = lunrBuilder.build();
                }

                let queryString = event.data.queryString;
                // Multi-word, partial-word, fuzzy search
                let hits = lunrIndex.query(q => {
                    lunr.tokenizer(queryString).forEach(function (token) {
                        let subQueryString = token.toString();

                        q.term(subQueryString, { fields: ['title'], usePipeline: true, boost: 200 })
                        // Start and end wild cards, e.g "correct" will match with "rre". Note that wildcard query strings are not passed 
                        // through the search pipeline since they are hard to stem.
                        q.term("*" + subQueryString + "*", { fields: ['title'], usePipeline: true, boost: 100 })
                        // TODO disabled since there is no way to highlight fuzzily matched words
                        // Fuzzy maching, e.g "correct" will match with search term "correcc"
                        // q.term(subQueryString, { fields: ['title'], usePipeline: true, editDistance: 1 })

                        q.term(subQueryString, { fields: ['text'], usePipeline: true, boost: 20 })
                        q.term("*" + subQueryString + "*", { fields: ['text'], usePipeline: true, boost: 10 })
                        // q.term(subQueryString, { fields: ['text'], usePipeline: true, editDistance: 1 })
                    })
                });
                let results = [];
                hits.forEach(function (hit) {
                    let item = searchData[hit.ref];
                    results.push(item);
                });
                postMessage({ results: results });
            }
    }
}
