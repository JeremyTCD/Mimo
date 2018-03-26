import { injectable, inject } from 'inversify';

import * as SmoothScroll from 'smooth-scroll';
import GlobalService from './globalService';

@injectable()
export default class LinkService implements GlobalService {

    public setupImmediate(): void {
        this.setupSmoothScroll();
        this.setupOpenExternalLinksInNewTab();
    }

    public setupOnDomContentLoaded(): void {
        
    }

    public setupOnLoad(): void {
        
    }

    private setupSmoothScroll(): void {
        // Smooth-scroll plugin is smoother than this CSS property
        //if (!CSS.supports('scroll-behavior', 'smooth')) {
            // Anchors with hrefs that contain #
            let scroll = new SmoothScroll('a[href*="#"]');
        //} 
    }

    private setupOpenExternalLinksInNewTab(): void {
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
