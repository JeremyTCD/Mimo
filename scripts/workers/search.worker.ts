(function() {
  let lunr = require('lunr');
  var lunrIndex = lunr(function() {
      this.pipeline.remove(lunr.stopWordFilter);
      this.ref('relPath');
      this.field('text'); 
  });
  lunr.tokenizer.seperator = /[\s\-\.]+/;

  var stopWordsRequest = new XMLHttpRequest();
  stopWordsRequest.open('GET', '/search-stopwords.json');
  stopWordsRequest.onload = function() {
    if (stopWordsRequest.status != 200) {
      return;
    }
    var stopWords = JSON.parse(stopWordsRequest.responseText);
    var docfxStopWordFilter = lunr.generateStopWordFilter(stopWords);
    lunr.Pipeline.registerFunction(docfxStopWordFilter, 'docfxStopWordFilter');
    lunrIndex.pipeline.add(docfxStopWordFilter);
  }
  stopWordsRequest.send();

  var searchData = {};
  var searchDataRequest = new XMLHttpRequest();

  searchDataRequest.open('GET', '/index.json');
  searchDataRequest.onload = function() {
    if (searchDataRequest.status != 200) {
      return;
    }
    searchData = JSON.parse(searchDataRequest.responseText);
    for (var prop in searchData) {
      lunrIndex.add(searchData[prop]);
    }
    postMessage({e: 'index-ready'});
  }
  searchDataRequest.send();

  onmessage = function (event: MessageEvent) {
    var q = event.data.q;
    var hits = lunrIndex.search(q);
    var results = [];
    hits.forEach(function(hit) {
      var item = searchData[hit.ref];
      results.push(item.snippetHtml);
    });
    postMessage({e: 'query-ready', q: q, d: results});
  }
})();
