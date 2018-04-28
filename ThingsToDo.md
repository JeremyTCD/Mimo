# Document Serving
## Using The mimo-website package
### Scripts
 The mimo project must have the following tsconfig options:
- compilerOptions.paths must have an entry aliasing `mimo-website/*` to `node_modules/mimo-website/dist/scripts/*`.
### Styles
Styles should be referenced directly from `node_modules/mimo-website/styles`.

## Using The mimo-website repository
Using `yarn run serve <mimo project>` in the mimo-website repository, the source code in the mimo-website repository can be used on any mimo project.
### Scripts
 The mimo project must have the following tsconfig options:
- compilerOptions.typeRoots must contain the node_modules/@types of the mimo repository and the mimo project being served. 
- compilerOptions.paths must have an entry aliasing `mimo-website/*` to `<mimo repository>/scripts/*`.
- compilerOptions.include must contain the path pointing to `<mimo repository>/scripts/typings/*.d.ts`.
### Styles
webpack.config automatically resolves scss imports to `__dirname/../styles`. Note that while serving a mimo
project using the mimo-website repository's source files, intellisense will have no knowledge of the 
mimo-website repository's files.

# Document Extending Mimo
## Scripts
Host automatically registers default services. The container with default services can be obtained using 
`Host.getContainer()`. Mimo can be extended and modified by adding and overriding services. `Host.run()` 
calls the lifecycle methods in components and global services. 

## Styles
Mimo exports a bunch of scss files. These can be imported through the consolidation file `node_modules/mimo-website/dist/styles/mimo`
or they can be imported individually. One of these files contains scss constants. These constants can be 
overriden by declaring scss variables with the same names before importing mimo's constants.

# Document Known Bugs
## Firefox Animation Bugs
Firefox attempts to optimize power consumption by throttling "hidden" animations. Unfortunately, animations that start with `scale(0, 0)` (0 in either axis) get throttled:
	- https://bugzilla.mozilla.org/show_bug.cgi?id=1435902
	- https://bugzilla.mozilla.org/show_bug.cgi?id=1425213
## Edge Sticky Issues
When page is in narrow mode, table of contents does not work if page is at the top. This is because of the interaction between `position: sticky` and `translate`.
	- https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15949572/
## Dropdown Article Menu Scroll To Anchor Bug When Scrollbar is Not Overlayed
Body overflow is set to hidden when dropdown article menu is active. After a link is clicked, body overflow is set to auto again. If the removal of the scrollbar
causes body height to change (wrapping changes), smooth scroll will scroll to the wrong coordinates. This is not a critical problem since all mobile browsers 
have overlay scrollbars
## Edges of SVGs are Fuzzy When Being Scaled
Scaling to 1 produces smoother animations. A possible solutions would be to wrap SVGs in divs that have size = shrinked size, place SVGs in the middle of divs using translate, 
then shrink using scale and expand to 1 on hover or whatever.
## Side Menus Flicker on Edge and Firefox when Scrolled to Bottom.
Setting of menu height is somehow delayed, not sure what the root problem is.

# Optimize animations 
Run all animations on the compositor.
- Change fill/background-color animations to opacity animations (for svgs, just create an extra layer within with opacity 0).
- Use transform instead of background-size as far as possible.