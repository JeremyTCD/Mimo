import * as SmoothScroll from 'smooth-scroll';

class LinkService {

    public setupSmoothScroll(): void {
        // Anchors with hrefs that contain #
        let scroll = new SmoothScroll('a[href*="#"]');
    }

    public setupOpenExternalLinksInNewTab(): void {
        $(document.links).
            filter(function () {
                return (this as HTMLAnchorElement).hostname !== window.location.hostname;
            }).
            attr('target', '_blank').
            // Prevents malicious sites from manipulating the window object https://mathiasbynens.github.io/rel-noopener/#hax
            attr('rel', 'noopener');
    }
}

export default new LinkService();