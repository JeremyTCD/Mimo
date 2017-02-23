import AnchorJs = require('anchor-js');
import hljs = require('highlightjs');
import * as $ from 'jquery';
import headerBuilder from './header';
import articleListBuilder from './articleList';
import setupToc from './toc';
import breadcrumbs from './breadcrumbs';

$(function () {
    var active = 'active';
    var expanded = 'in';
    var collapsed = 'collapsed';
    var filtered = 'filtered';
    var show = 'show';
    var hide = 'hide';

    // Styling for tables in conceptual documents using Bootstrap.
    // See http://getbootstrap.com/css/#tables
    (function () {
        $('table').addClass('table table-bordered table-striped table-condensed');
    })();

    // Styling for alerts.
    (function () {
        $('.NOTE, .TIP').addClass('alert alert-info');
        $('.WARNING').addClass('alert alert-warning');
        $('.IMPORTANT, .CAUTION').addClass('alert alert-danger');
    })();

    // Enable anchors for headings.
    (function () {
        let anchors = new AnchorJs();
        anchors.options = {
            placement: 'left',
            visible: 'touch'
        };
        anchors.add('article h2:not(.no-anchor), article h3, article h4, article h5, article h6');
    })();

    // Open links to different host in a new window.
    (function () {
        if ($("meta[property='docfx:newtab']").attr("content") === "true") {
            $(document.links).filter(function () {
                return this.hostname !== window.location.hostname;
            }).attr('target', '_blank');
        }
    })();

    // Enable highlight.js
    (function () {
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    })();

    // Line highlight for code snippet
    (function () {
        $('pre code[highlight-lines]').each(function (i, block) {
            if (block.innerHTML === "") return;
            var lines = block.innerHTML.split('\n');

            let queryString = block.getAttribute('highlight-lines');
            if (!queryString) return;

            var ranges = queryString.split(',');
            for (var j = 0, range; range = ranges[j++];) {
                var found = range.match(/^(\d+)\-(\d+)?$/);
                if (found) {
                    // consider region as `{startlinenumber}-{endlinenumber}`, in which {endlinenumber} is optional
                    var start = +found[1];
                    var end = +found[2];
                    if (isNaN(end) || end > lines.length) {
                        end = lines.length;
                    }
                } else {
                    // consider region as a sigine line number
                    if (isNaN(range)) continue;
                    var start = +range;
                    var end = start;
                }
                if (start <= 0 || end <= 0 || start > end || start > lines.length) {
                    // skip current region if invalid
                    continue;
                }
                lines[start - 1] = '<span class="line-highlight">' + lines[start - 1];
                lines[end - 1] = lines[end - 1] + '</span>';
            }

            block.innerHTML = lines.join('\n');
        });
    })();

    articleListBuilder.build();
    headerBuilder.build();
    setupToc();

    //Setup Affix
    (function () {
        //var hierarchy = getHierarchy();
        //if (hierarchy.length > 0) {
        //  var html = '<h5 class="title">In This Article</h5>'
        //  html += formList(hierarchy, ['nav', 'bs-docs-sidenav']);
        //  $("#affix").append(html);
        //  if ($('footer').is(':visible')) {
        //    $(".sideaffix").css("bottom", "70px");
        //  }
        //  $('#affix').on('activate.bs.scrollspy', function (e) {
        //    if (e.target) {
        //      if ($(e.target).find('li.active').length > 0) {
        //        return;
        //      }
        //      var top = $(e.target).position().top;
        //      $(e.target).parents('li').each(function (i, e) {
        //        top += $(e).position().top;
        //      });
        //      var container = $('#affix > ul');
        //      var height = container.height();
        //      container.scrollTop(container.scrollTop() + top - height/2);
        //    }
        //  })
        //}

        function getHierarchy() {
            // supported headers are h1, h2, h3, and h4
            // The topest header is ignored
            var selector = ".article article";
            var affixSelector = "#affix";
            var headers = ['h4', 'h3', 'h2', 'h1'];
            var hierarchy = [];
            var toppestIndex = -1;
            var startIndex = -1;
            // 1. get header hierarchy
            for (var i = headers.length - 1; i >= 0; i--) {
                var header = $(selector + " " + headers[i]);
                var length = header.length;

                // If contains no header in current selector, find the next one
                if (length === 0) continue;

                // If the toppest header contains only one item, e.g. title, ignore
                if (length === 1 && hierarchy.length === 0 && toppestIndex < 0) {
                    toppestIndex = i;
                    continue;
                }

                // Get second level children
                var nextLevelSelector = i > 0 ? headers[i - 1] : null;
                var prevSelector;
                for (var j = length - 1; j >= 0; j--) {
                    var e = header[j];
                    var id = e.id;
                    if (!id) continue; // For affix, id is a must-have
                    var item = {
                        name: htmlEncode($(e).text()),
                        href: "#" + id,
                        items: []
                    };
                    if (nextLevelSelector) {
                        var selector = '#' + id + "~" + nextLevelSelector;
                        var currentSelector = selector;
                        if (prevSelector) currentSelector += ":not(" + prevSelector + ")";
                        $(header[j]).siblings(currentSelector).each(function (index, e) {
                            if (e.id) {
                                item.items.push({
                                    name: htmlEncode($(e).text()), // innerText decodes text while innerHTML not
                                    href: "#" + e.id

                                })
                            }
                        })
                        prevSelector = selector;
                    }
                    hierarchy.push(item);
                }
                break;
            };
            hierarchy.reverse();
            return hierarchy;
        }

        function htmlEncode(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function htmlDecode(value) {
            return String(value)
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
        }
    })();

    // For LOGO SVG
    // Replace SVG with inline SVG
    // http://stackoverflow.com/questions/11978995/how-to-change-color-of-svg-image-using-css-jquery-svg-image-replacement
    jQuery('img.svg').each(function () {
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function (data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');
    });
})
