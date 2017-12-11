import * as lunr from 'lunr';

let stopWords: string[] = ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else",
  "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither",
  "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too",
  "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your"];

(function () {
  let lunrBuilder = new lunr.Builder();

  // Setup documents
  lunrBuilder.ref('relPath');
  lunrBuilder.field('title');
  lunrBuilder.field('text');

  // TODO - https://github.com/olivernn/lunr.js/issues/323
  // lunr.tokenizer.separator = /[\s\-\.]+/;

  // Setup search data
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
    let highlightString = "";
    // Multi-word, partial-word, field weighted search
    let hits = lunrIndex.query(q => {
      lunr.tokenizer(queryString).forEach(function (token) {
        let subQueryString = token.toString();
        if (stopWords.indexOf(subQueryString) == -1) {
          highlightString += " " + subQueryString;

          q.term(subQueryString, { fields: ['title'], usePipeline: true, boost: 200 })
          // Start and end wild cards, e.g "correct" will match with "rre". Note that wildcard query strings are not passed 
          // through the search pipeline since they are hard to stem.
          q.term("*" + subQueryString + "*", { fields: ['title'], usePipeline: true, boost: 100 })
          // Fuzzy maching, e.g "correct" will match with search term "correcc"
          q.term(subQueryString, { fields: ['title'], usePipeline: true, editDistance: 1 })

          q.term(subQueryString, { fields: ['text'], usePipeline: true, boost: 100 })
          q.term("*" + subQueryString + "*", { fields: ['text'], usePipeline: true, boost: 10 })
          q.term(subQueryString, { fields: ['text'], usePipeline: true, editDistance: 1 })
        }
      })
    });

    let results = [];
    hits.forEach(function (hit) {
      let item = searchData[hit.ref];
      results.push(item.snippetHtml);
    });
    postMessage({ e: 'query-ready', q: highlightString, d: results });
  }
})();
