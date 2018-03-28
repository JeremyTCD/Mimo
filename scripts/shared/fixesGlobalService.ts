import { injectable, inject } from 'inversify';
import GlobalService from './globalService';

@injectable()
export default class FixesGlobalService implements GlobalService {
    private _lastWindowWidth: number;

    public setupOnDomContentLoaded(): void {
    }

    public setupImmediate(): void {
        this._lastWindowWidth = window.outerWidth;
        window.addEventListener('resize', this.chromeBodyHeightFix);
    }

    // If there are horizontal scrollbars on a page and the viewport is resized horizontally such that these scrollbars no longer 
    // exist, chrome continues to include the heights of these scrollbars in body height until a layout that includes body occurs.
    // This extra height results in an empty area beneath footer.
    private chromeBodyHeightFix() {
        if (this._lastWindowWidth !== window.outerWidth) {
            document.body.style.height = '0';
            document.body.clientHeight;
            document.body.style.height = '';
            this._lastWindowWidth = window.outerWidth;
        }
    }

    public setupOnLoad(): void {
    }
}
