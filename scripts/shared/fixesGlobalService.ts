import { injectable } from 'inversify';
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
        // When a page is reloaded, elements begin with the state they had just prior to the page reload. For instance, if prior to the reload, an element had opacity 1, it has opacity 1 immediately 
        // after the reload, even if the styles for the element specify an opacity of 0. If the element in the example has a transition for its opacity, it begins transitioning from 1 to 0 immediately
        // after reload. If the same element has a transition after reload (for instance a script might set its opacity as 1, just after load), the browser ends up displaying a flicker: element goes from
        // opacity 1 > ~0 (depending on how long the transitions is and how long before the script sets opacity to 1), then from 0 > 1. This effect is extremely unpleasant. Therefore, prior to the load 
        // event, all elements have transition set to none (see base.scss), all elements will thus begin at the state specified by their styles. Immediately after the load event, this overriding of 
        // transitions must be removed:
        document.body.classList.remove('preload');
    }
}
