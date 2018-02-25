# Changelog
This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/JeremyTCD/Mimo/compare/1.0.0-alpha.9...HEAD)

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

## 1.0.0-alpha.1 - Jan 16, 2018
Initial release.