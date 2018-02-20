import * as SmoothScroll from 'smooth-scroll';

class LinkService {

    public setupSmoothScroll(): void {
        // Smooth-scroll plugin is smoother than this CSS property
        //if (!CSS.supports('scroll-behavior', 'smooth')) {
            // Anchors with hrefs that contain #
            let scroll = new SmoothScroll('a[href*="#"]');
        //} 
    }

    public setupOpenExternalLinksInNewTab(): void {
        let anchorElements = document.getElementsByTagName('a');

        for (let i = 0; i < anchorElements.length; i++) {
            let anchorElement = anchorElements[i];

            if ((anchorElement as HTMLAnchorElement).hostname === window.location.hostname) {
                continue;
            }

            anchorElement.setAttribute('target', '_blank');
            // Prevents malicious sites from manipulating the window object https://mathiasbynens.github.io/rel-noopener/#hax
            anchorElement.setAttribute('rel', 'noopener');
        }
    }
}

export default new LinkService();