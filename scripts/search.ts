import 'mark.js';

// Support full-text-search
(function () {
  var query;
  var relHref = $("meta[property='docfx\\:rel']").attr("content");

  var searchResult = $("#search-results");

  if (typeof searchResult != 'undefined') {
    var search = searchFactory();
    search();
    highlightKeywords();
    addSearchEvent();
  }

  // Search factory
  function searchFactory() {
    if (Worker) {
      var worker = new Worker('/styles/searchWorker.js');
      if (!worker) return localSearch;
    } else {
      return localSearch;
    }

    function localSearch() {
      console.log("using local search");
      var lunrIndex = lunr(function () {
        this.ref('href');
        this.field('text');
      });
      lunr.tokenizer.seperator = /[\s\-\.]+/;
      var searchData = {};
      var searchDataRequest = new XMLHttpRequest();

      var indexPath = "/index.json";
      if (indexPath) {
        searchDataRequest.open('GET', indexPath);
        searchDataRequest.onload = function () {
          if (searchDataRequest.status != 200) {
            return;
          }
          searchData = JSON.parse(searchDataRequest.responseText);
          for (var prop in searchData) {
            lunrIndex.add(searchData[prop]);
          }
        }
        searchDataRequest.send();
      }

      $("body").bind("queryReady", function () {
        var hits = lunrIndex.search(query);
        var results = [];
        hits.forEach(function (hit) {
          var item = searchData[hit.ref];
          results.push(item.snippetHtml);
        });
        handleSearchResults(results);
      });
    }

    function webWorkerSearch() {
      console.log("using Web Worker");
      var indexReady = $.Deferred();

      worker.onmessage = function (oEvent) {
        switch (oEvent.data.e) {
          case 'index-ready':
            indexReady.resolve();
            break;
          case 'query-ready':
            var hits = oEvent.data.d;
            handleSearchResults(hits);
            break;
        }
      }

      indexReady.promise().done(function () {
        $("body").bind("queryReady", function () {
          worker.postMessage({ q: query });
        });
      });
    }
  };

  // Highlight the searching keywords
  function highlightKeywords() {
    var q = url('?q');
    if (q !== null) {
      var keywords = q.split("%20");
      keywords.forEach(function (keyword) {
        if (keyword !== "") {
          $('.data-searchable *').mark(keyword);
          $('article *').mark(keyword);
        }
      });
    }
  }

  function addSearchEvent() {
    $('body').bind("searchEvent", function () {
      $('#search-query').keypress(function (e) {
        return e.which !== 13;
      });

      $('#search-query').keyup(function () {
        query = $(this).val();
        if (query.length < 3) {
          flipContents("show");
        } else {
          flipContents("hide");
          $("body").trigger("queryReady");
          $('#search-results>.search-list').text('Search Results for "' + query + '"');
        }
      }).off("keydown");
    });
  }

  function flipContents(action) {
    if (action === "show") {
      $('.hide-when-search').show();
      $('#search-results').hide();
    } else {
      $('.hide-when-search').hide();
      $('#search-results').show();
    }
  }

  function handleSearchResults(hits) {
    var numPerPage = 5;
    $('#sr-pagination').empty();
    $('#sr-pagination').removeData("twbs-pagination");
    if (hits.length === 0) {
      $('#search-results > .sr-items').html('<p>No results found</p>');
    } else {
      $('#sr-pagination').twbsPagination({
        totalPages: Math.ceil(hits.length / numPerPage),
        visiblePages: 5,
        onPageClick: function (event, page) {
          var start = (page - 1) * numPerPage;
          var curHits = hits.slice(start, start + numPerPage);
          $('#search-results>.sr-items').empty().append(
            curHits
          );
          query.split(/\s+/).forEach(function (word) {
            if (word !== '') {
              $('#search-results>.sr-items *').mark(word);
            }
          });
        }
      });
    }
  }
})();