import AnchorJs = require('anchor-js');
import hljs = require('highlightjs');
import * as $ from 'jquery';
import { SetupHeaderAnimationWrapper } from './header';

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
      $(document.links).filter(function() {
        return this.hostname !== window.location.hostname;
      }).attr('target', '_blank');
    }
  })();

  // Enable highlight.js
  (function () {
    $('pre code').each(function(i, block) {
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

  // Update href in navbar
  (function () {
    var toc = $('#sidetoc');
    var breadcrumb = new Breadcrumb();
    loadNavbar();
    loadToc();
    function loadNavbar() {
      var navbarPath = $("meta[property='docfx\\:navrel']").attr("content");
      var tocPath = $("meta[property='docfx\\:tocrel']").attr("content");
      if (tocPath) tocPath = tocPath.replace(/\\/g, '/');
      if (navbarPath) navbarPath = navbarPath.replace(/\\/g, '/');
      $.get(navbarPath, function (data) {
          $(data).find("#toc>ul").appendTo("#header-navbar");
        if ($('#search-results').length !== 0) {
          $('#search').show();
          $('body').trigger("searchEvent");
        }
        var index = navbarPath.lastIndexOf('/');
        var navrel = '';
        if (index > -1) {
          navrel = navbarPath.substr(0, index + 1);
        }
        var currentAbsPath = getAbsolutePath(window.location.pathname);
        // set active item
        $('#header-navbar').find('a[href]').each(function (i, e:HTMLAnchorElement) {
          var href = $(e).attr("href");
          if (isRelativePath(href)) {
            href = navrel + href;
            $(e).attr("href", href);

            // TODO: currently only support one level navbar
            var isActive = false;
            var originalHref = e.name;
            if (originalHref) {
              originalHref = navrel + originalHref;
              if (getDirectory(getAbsolutePath(originalHref)) === getDirectory(getAbsolutePath(tocPath))) {
                isActive = true;
              }
            } else {
              if (getAbsolutePath(href) === currentAbsPath) {
                isActive = true;
              }
            }
            if (isActive) {
              $(e).addClass(active);
              if (!breadcrumb.isNavPartLoaded) {
                breadcrumb.insert({
                  href: e.href,
                  name: e.innerHTML
                }, 0);
                breadcrumb.isNavPartLoaded = true;
              }
            } else {
              $(e).removeClass(active)
            }
          }
        });

        SetupHeaderAnimationWrapper();
      });
    }

    function loadToc() {
      var tocPath = $("meta[property='docfx\\:tocrel']").attr("content");
      if (tocPath) tocPath = tocPath.replace(/\\/g, '/');
      $('#sidetoc').load(tocPath + " #sidetoggle > div", function () {
        if ($('footer').is(':visible')) {
          $('.sidetoc').addClass('shiftup');
        }
        registerTocEvents();

        var index = tocPath.lastIndexOf('/');
        var tocrel = '';
        if (index > -1) {
          tocrel = tocPath.substr(0, index + 1);
        }
        var currentHref = getAbsolutePath(window.location.pathname);
        $('#sidetoc').find('a[href]').each(function (i, e: HTMLAnchorElement) {
          var href = $(e).attr("href");
          if (isRelativePath(href)) {
            href = tocrel + href;
            $(e).attr("href", href);
          }

          if (getAbsolutePath(e.href) === currentHref) {
            $(e).parent().addClass(active);
            let parent = $(e).parent().parents('li').children('a');
            if (!breadcrumb.isTocPartLoaded) {
              for (var i = parent.length - 1; i >= 0; i--) {
                breadcrumb.push({
                  href: (parent[i] as HTMLAnchorElement).href,
                  name: parent[i].innerHTML
                });
              }
              breadcrumb.push({
                href: e.href,
                name: e.innerHTML
              });
              breadcrumb.isTocPartLoaded = true;
            }
            if (parent.length > 0) {
              parent.addClass(active);
            }
            // for active li, expand it
            $(e).parents('ul.nav>li').addClass(expanded);

            // Scroll to active item
            var top = 0;
            $(e).parents('li').each(function (i, e) {
              top += $(e).position().top;
            });
            // 50 is the size of the filter box
            $('.sidetoc').scrollTop(top - 50);
            if ($('footer').is(':visible')) {
              $('.sidetoc').addClass('shiftup');
            }
          } else {
            $(e).parent().removeClass(active);
            $(e).parents('li').children('a').removeClass(active);
          }
        });
      });
    }

    function registerTocEvents() {
      $('.toc .nav > li > .expand-stub').click(function (e) {
        $(e.target).parent().toggleClass(expanded);
      });
      $('.toc .nav > li > .expand-stub + a:not([href])').click(function (e) {
        $(e.target).parent().toggleClass(expanded);
      });
      $('#toc_filter_input').on('input', function (e) {
        var val = this.value;
        if (val === '') {
          // Clear 'filtered' class
          $('#toc li').removeClass(filtered).removeClass(hide);
          return;
        }

        // Get leaf nodes
        $('#toc li>a').filter(function (i, e) {
          return $(e).siblings().length === 0
        }).each(function (i, anchor) {
          var text = $(anchor).text();
          var parent = $(anchor).parent();
          var parentNodes = parent.parents('ul>li');
          for (var i = 0; i < parentNodes.length; i++) {
            var parentText = $(parentNodes[i]).children('a').text();
            if (parentText) text = parentText + '.' + text;
          };
          if (filterNavItem(text, val)) {
            parent.addClass(show);
            parent.removeClass(hide);
          } else {
            parent.addClass(hide);
            parent.removeClass(show);
          }
        });
        $('#toc li>a').filter(function (i, e) {
          return $(e).siblings().length > 0
        }).each(function (i, anchor) {
          var parent = $(anchor).parent();
          if (parent.find('li.show').length > 0) {
            parent.addClass(show);
            parent.addClass(filtered);
            parent.removeClass(hide);
          } else {
            parent.addClass(hide);
            parent.removeClass(show);
            parent.removeClass(filtered);
          }
        })

        function filterNavItem(name, text) {
          if (!text) return true;
          if (name.toLowerCase().indexOf(text.toLowerCase()) > -1) return true;
          return false;
        }
      });
    }

    function Breadcrumb() {
      var breadcrumb = [];
      var isNavPartLoaded = false;
      var isTocPartLoaded = false;
      this.push = pushBreadcrumb;
      this.insert = insertBreadcrumb;

      function pushBreadcrumb(obj) {
        breadcrumb.push(obj);
        setupBreadCrumb(breadcrumb);
      }

      function insertBreadcrumb(obj, index) {
        breadcrumb.splice(index, 0, obj);
        setupBreadCrumb(breadcrumb);
      }

      function setupBreadCrumb(breadcrumb) {
        var html = formList(breadcrumb, 'breadcrumb');
        $('#breadcrumb').html(html);
      }
    }

    function getAbsolutePath(href) {
      // Use anchor to normalize href
      var anchor = $('<a href="' + href + '"></a>')[0] as HTMLAnchorElement;
      // Ignore protocal, remove search and query
      return anchor.host + anchor.pathname;
    }

    function isRelativePath(href) {
      return !isAbsolutePath(href);
    }

    function isAbsolutePath(href) {
      return (/^(?:[a-z]+:)?\/\//i).test(href);
    }

    function getDirectory(href) {
      if (!href) return '';
      var index = href.lastIndexOf('/');
      if (index == -1) return '';
      if (index > -1) {
        return href.substr(0, index);
      }
    }
  })();

  //Setup Affix
  (function () {
    var hierarchy = getHierarchy();
    if (hierarchy.length > 0) {
      var html = '<h5 class="title">In This Article</h5>'
      html += formList(hierarchy, ['nav', 'bs-docs-sidenav']);
      $("#affix").append(html);
      if ($('footer').is(':visible')) {
        $(".sideaffix").css("bottom", "70px");
      }
      $('#affix').on('activate.bs.scrollspy', function (e) {
        if (e.target) {
          if ($(e.target).find('li.active').length > 0) {
            return;
          }
          var top = $(e.target).position().top;
          $(e.target).parents('li').each(function (i, e) {
            top += $(e).position().top;
          });
          var container = $('#affix > ul');
          var height = container.height();
          container.scrollTop(container.scrollTop() + top - height/2);
        }
      })
    }

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

  function formList(item, classes) {
    var level = 1;
    var model = {
      items: item
    };
    var cls = [].concat(classes).join(" ");
    return getList(model, cls);

    function getList(model, cls) {
      if (!model || !model.items) return null;
      var l = model.items.length;
      if (l === 0) return null;
      var html = '<ul class="level' + level + ' ' + (cls || '') + '">';
      level++;
      for (var i = 0; i < l; i++) {
        var item = model.items[i];
        var href = item.href;
        var name = item.name;
        if (!name) continue;
        html += href ? '<li><a href="' + href + '">' + name + '</a>' : '<li>' + name;
        html += getList(item, cls) || '';
        html += '</li>';
      }
      html += '</ul>';
      return html;
    }
  }

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
