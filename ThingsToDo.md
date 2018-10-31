# Misc Further Improvments
- Article menu header in narrow mode: avoid repaints by using different elements with preset text, toggling opacity on active section change.
- Sharpen calendar icon.

# Misc Bugs
- Article menu indicator flickers while moving in edge. This occurs only for some articles, such as "formatting articles".

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