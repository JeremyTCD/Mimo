import * as lunr from 'lunr';

(function () {
  let lunrBuilder = new lunr.Builder();
  lunrBuilder.pipeline.remove(lunr.stopWordFilter);
  lunrBuilder.ref('relPath');
  lunrBuilder.field('title');
  lunrBuilder.field('text');

  // TODO - https://github.com/olivernn/lunr.js/issues/323
  // lunr.tokenizer.separator = /[\s\-\.]+/;

  let stopWordsRequest = new XMLHttpRequest();
  stopWordsRequest.open('GET', '/search-stopwords.json');
  stopWordsRequest.onload = function() {
    if (stopWordsRequest.status != 200) {
      return;
    }
    let stopWords = JSON.parse(stopWordsRequest.responseText);
    let docfxStopWordFilter = lunr.generateStopWordFilter(stopWords);
    lunr.Pipeline.registerFunction(docfxStopWordFilter, 'docfxStopWordFilter');
    lunrBuilder.pipeline.add(docfxStopWordFilter);
  }
  stopWordsRequest.send();

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
    if (!lunrIndex) {
      lunrIndex = lunrBuilder.build();
    }

    let queryString = event.data.q;
    let hits = lunrIndex.query(q => {
      q.term(queryString, { fields:['title'], usePipeline: true, boost: 200 })
      // Start and end wild cards, e.g "correct" will match with "rre". Note that wildcard query strings are not passed 
      // through the search pipeline since they are hard to stem.
      q.term("*" + queryString + "*", {  fields:['title'], usePipeline: false, boost: 100 }) 
      // Fuzzy maching, e.g "correct" will match with search term "correcc"
      q.term(queryString, {  fields:['title'], usePipeline: false, editDistance: 1 }) 
      
      q.term(queryString, { fields:['text'], usePipeline: true, boost: 100 })
      q.term("*" + queryString + "*", {  fields:['text'], usePipeline: false, boost: 10 }) 
      q.term(queryString, {  fields:['text'], usePipeline: false, editDistance: 1 }) 
    });
    let results = [];
    hits.forEach(function (hit) {
      let item = searchData[hit.ref];
      results.push(item.snippetHtml);
    });
    postMessage({ e: 'query-ready', q: queryString, d: results });
  }
})();
