// Copyright (c) JeremyTCD. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.
import * as $ from 'jquery';
import 'twbs-pagination';

$(function () {
  // Prepare pagination for article list
  (function () {
    var numPerPage = 3;
    var allAlItems = $('.al-items-all > .al-item');

    if(allAlItems.length == 0){
        return;
    }

    $('#al-pagination').twbsPagination({
        totalPages: Math.ceil(allAlItems.length / numPerPage),
        visiblePages: 5,
        onPageClick: function (event, page) {
          var start = (page - 1) * numPerPage;
          var currentAlItems = allAlItems.slice(start, start + numPerPage);
          $('.al-items-current').empty().append(currentAlItems);
        }
    })
  })();
})
