/**
 * Opens external links in new tabs
 */
export function openExternalLinksInNewTab(): void {
    if ($("meta[property='docfx:newtab']").attr("content") === "true") {
        $(document.links).filter(function () {
            return this.hostname !== window.location.hostname;
        }).attr('target', '_blank');
    }
}