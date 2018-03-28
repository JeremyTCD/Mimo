import { injectable, inject } from 'inversify';

import GlobalService from './globalService';

@injectable()
export default class LinkGlobalService implements GlobalService {

    public setupImmediate(): void {
        this.setupOpenExternalLinksInNewTab();
    }

    public setupOnDomContentLoaded(): void {
        
    }

    public setupOnLoad(): void {
        
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
