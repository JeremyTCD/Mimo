import "../styles/index.scss";
import '../node_modules/font-awesome/scss/font-awesome.scss';

import AnchorJs = require('anchor-js');
import HighlightJs = require('highlightjs');

import headerBuilder from './header';
import articleListBuilder from './articleList';
import searchBuilder from './search';
import leftMenuToggleBuilder from './leftMenuToggle';
import leftMenuBuilder from './leftMenu';
import footerBuilder from './footer';
import affixBuilder from './affix';

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
            HighlightJs.highlightBlock(block);
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

    searchBuilder.build();
    articleListBuilder.build();
    headerBuilder.build();
    leftMenuBuilder.build();
    footerBuilder.build();
    leftMenuToggleBuilder.build();
    affixBuilder.build();

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
