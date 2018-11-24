# Changelog
This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html). Refer to 
[The Semantic Versioning Lifecycle](https://www.jeremytcd.com/articles/the-semantic-versioning-lifecycle)
for an overview of semantic versioning.

## [Unreleased (1.0.0-alpha.25)](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.24...HEAD)

## [1.0.0-alpha.24](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.23...1.0.0-alpha.24) - Nov 24, 2018
## Additions
- Mobile browser address bar color now specifyable using mimo_addressBarColor.

## Fixes
- Fixed empty area beneath footer by setting body min-height to 100vh instead of 100%. 

## [1.0.0-alpha.23](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.22...1.0.0-alpha.23) - Nov 17, 2018
## Changes
- Bumped DocFx.Plugins version.

## [1.0.0-alpha.22](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.21...1.0.0-alpha.22) - Nov 13, 2018
### Changes
- Improved support for social media cards.
- Inlined search worker.
- Removed runtime and vendor js bundles.
- Added post processing plugin to webpack.config:
  - Inlines SVGs.
  - Updates URLs with hashes.
  - Minifies HTML.
- Minor improvements to search.
  - DocumentFragments now cached.
- Removed unused services.

## [1.0.0-alpha.21](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.20...1.0.0-alpha.21) - Nov 8, 2018
### Fixes
- Css-loader no longer processes url() statements.
- Fixed regex used to identify URIs in HTML that need to have hashes appended.

## [1.0.0-alpha.20](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.19...1.0.0-alpha.20) - Nov 7, 2018
### Changed
- Bumped DocFx.Plugins version.
- Collapsible menu expandable nodes are now clickable if they are anchors.
- Category menu svg icons now transition to #fff when their parent anchors are active or hovered over.
- Tweaked author image in article metadata.

## [1.0.0-alpha.19](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.18...1.0.0-alpha.19) - Nov 1, 2018
### Changed
- Removed jQuery.
- Updated icons.
- Updated scripts and styles for FlexiBlocks.
- Clicking on overlay now closes dropdowns and search results.
- Added TocEmbedder.

## [1.0.0-alpha.18](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.17...1.0.0-alpha.18) - Jun 27, 2018
### Changed
- Darkened border under header.
- Simplified Mimo attribution in footer.
- Active anchor in navbar now gray instead of bold.

## [1.0.0-alpha.17](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.16...1.0.0-alpha.17) - Jun 13, 2018
### Changed
- Added border under header to demarcate it.
### Fixed
- Cleaned up SVG icons, removed redundant stuff added by illustrator.

## [1.0.0-alpha.16](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.15...1.0.0-alpha.16) - Apr 28, 2018
### Changed
- h4, h5 and h6 elements now have font-weight: bold.
- Bumped MimoMarkdown, changes table structure.
### Added
- Highlight.js language specific styles for html, scss and css.
- Responsive tables styles.
### Fixed
- Fixed long strings not wrapping, causing horizontal overflow.

## [1.0.0-alpha.15](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.14...1.0.0-alpha.15) - Apr 21, 2018
### Fixed
- Header navigation bar displaying wrong links in the 404 page.

## [1.0.0-alpha.14](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.13...1.0.0-alpha.14) - Apr 20, 2018
### Fixed
- Js error if current page is not listed in section menu.
- Page snapping to top after resize.

## [1.0.0-alpha.13](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.12...1.0.0-alpha.13) - Apr 16, 2018
### Fixed
- Removed unecessary fix for scroll position issues.
- Fixed wonky an animations on page reload.
- Fixed section pages component load bug.

## [1.0.0-alpha.12](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.11...1.0.0-alpha.12) - Apr 14, 2018
### Added
- Responsive tables.
- Share article button.
- Support for social media cards (facebook and twitter).
- Performant dropdown menus (visible when screen is narrow). 
### Changed
- Completely re-organized logic and styles for extensibility. Scripts can now be extended through a dependency injection container. 
Sass variables can now be overriden.
- Updated tooling to facilitate extensibility.
- Sped up animations site-wide to make site feel snappier.
- Comments now use IntersectionObserver to determine when to load.
### Fixed
- Inumerable fixes.

## [1.0.0-alpha.11](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.10...1.0.0-alpha.11) - Mar 5, 2018
### Added
- mimo_headerElements option for adding elements to header (meant for stuff like meta and link elements).
- Locally hosted fonts for example article.
### Changed
- Improved article metadata, can now specify multiple authors, photo and author links no longer fixed to github profile links.
### Fixed
- Text in tables being enlarged in chrome because of text-size-adjust.

## [1.0.0-alpha.10](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.9...1.0.0-alpha.10) - Mar 2, 2018
### Changed
- Removed max-width for container and articles.
- Increased width of side menus.
- Changed package name to mimo-website.
- Removed extensions from hrefs in article lists.
- Default attribution text for exmaple blog.
### Fixed
- Comments component.
- Inline code background not having enough contrast with alert backgrounds.

## [1.0.0-alpha.9](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.8...1.0.0-alpha.9) - Feb 25, 2018
### Added
- Development server now redirects paths with no extension to the relevant html files. For example, `/index` is now redirected to `/index.html`.
### Changed
- Simplified links in example blog articles (removed `.html` where appropriate).
- Changed example blog article names to hyphenated strings instead of camelCase strings.

## [1.0.0-alpha.8](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.7...1.0.0-alpha.8) - Feb 24, 2018
### Added
- Page specific style sheets for example blog.
### Changed
- Changed article options prefix from `jtcd_` to `mimo_`.
- Minor changes to article and footer styles.
### Fixed
- Text-shadow overlapping underlines.
- Removed redundant titles from some articles in example blog.

## [1.0.0-alpha.7](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.6...1.0.0-alpha.7) - Feb 23, 2018
### Added
- Styles and resources for markdown features such as tables, images, code and the like.
- Custom markdown through [MimoMarkdown](https://github.com/JeremyTCD/DocFx.Plugins.MimoMarkdown).
- New right menu indicator that is more consistent with Mimo's style.
- Draft pages for Mimo's documentation.
### Changed
- Styles across the page.

## [1.0.0-alpha.6](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.5...1.0.0-alpha.6) - Jan 27, 2018
### Added
- Content for example page "Article with Links to Other Articles"
- Outline for "Publishing Your Site" section in readme.
### Changed
- Styles across the page.
- All scripts now only use yarn.
- Content div in article element no longer has ID "content". Instead it has class "content".

## [1.0.0-alpha.5](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.4...1.0.0-alpha.5) - Jan 26, 2018
### Added
- Minor performance enhancement for back to top button.
### Changed
- Renamed blog example's 404 page so it works with github pages out of the box.
### Fixed
- Back to top button being visible at the wrong time on some browsers.
- Search not working if there are no searcheable pages. 

## [1.0.0-alpha.4](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.3...1.0.0-alpha.4) - Jan 25, 2018
### Added
- domready as library for running logic after DomContentLoaded. 
### Changed
- Line height for h1 elements increased from 1.1 to 1.3 for aesthetic reasons.
### Fixed
- Minor style fixes.

## [1.0.0-alpha.3](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.2...1.0.0-alpha.3) - Jan 24, 2018
### Added
- Standalone contact page for example project (before, contact was just a section in the about page).
- Clear button for filter and search inputs. 
### Changed
- Minor style improvements across the page.
- Miscellaneous improvements to the example project.
### Fixed
- Filter bugs related to expanding and collapsing of topics. 

## [1.0.0-alpha.2](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.1...1.0.0-alpha.2) - Jan 22, 2018
### Added
- jtcd_date can now be in [MMM d, yyyy](https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings) format.
### Changed
- Minor style improvements across the page.
- Miscellaneous improvements to the example project.
### Fixed
- Dealt with some serve mode issues.
- Back to top button now fades in and out correctly.

## [1.0.0-alpha.1](https://github.com/JeremyTCD/Mimo/tree/1.0.0-alpha.1) - Jan 16, 2018
Initial release.