/**
 * Opens external links in new tabs
 */
export function openExternalLinksInNewTab(): void {
    $(document.links).
        filter(function () {
            return (this as HTMLAnchorElement).hostname !== window.location.hostname;
        }).
        attr('target', '_blank').
        // Prevents malicious sites from manipulating the window object https://mathiasbynens.github.io/rel-noopener/#hax
        attr('rel', 'noopener'); 
}