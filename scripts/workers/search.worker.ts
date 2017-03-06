(function() {
  let lunr = require('lunr');
  let lunrIndex = lunr(function() {
      this.pipeline.remove(lunr.stopWordFilter);
      this.ref('relPath');
      this.field('title', { boost: 50 });
      this.field('text', { boost: 20 });
  });
  lunr.tokenizer.seperator = /[\s\-\.]+/;

  let stopWordsRequest = new XMLHttpRequest();
  stopWordsRequest.open('GET', '/search-stopwords.json');
  stopWordsRequest.onload = function() {
    if (stopWordsRequest.status != 200) {
      return;
    }
    let stopWords = JSON.parse(stopWordsRequest.responseText);
    let docfxStopWordFilter = lunr.generateStopWordFilter(stopWords);
    lunr.Pipeline.registerFunction(docfxStopWordFilter, 'docfxStopWordFilter');
    lunrIndex.pipeline.add(docfxStopWordFilter);
  }
  stopWordsRequest.send();

  let searchData = {};
  let searchDataRequest = new XMLHttpRequest();

  searchDataRequest.open('GET', '/index.json');
  searchDataRequest.onload = function() {
    if (searchDataRequest.status != 200) {
      return;
    }
    searchData = JSON.parse(searchDataRequest.responseText);
    for (let prop in searchData) {
      lunrIndex.add(searchData[prop]);
    }
    postMessage({e: 'index-ready'});
  }
  searchDataRequest.send();

  onmessage = function (event: MessageEvent) {
    let q = event.data.q;
    let hits = lunrIndex.search(q);
    let results = [];
    hits.forEach(function(hit) {
      let item = searchData[hit.ref];
      results.push(item.snippetHtml);
    });
    postMessage({e: 'query-ready', q: q, d: results});
  }
})();
