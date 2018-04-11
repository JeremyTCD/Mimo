import ResizeObserver from 'resize-observer-polyfill';
import { injectable } from 'inversify';
import RootComponent from '../shared/rootComponent';
import DebounceService from '../shared/debounceService';

@injectable()
export default class PageFooterComponent extends RootComponent {
    private _footerButtonElement: HTMLElement;

    private _debounceService: DebounceService;

    private _viewportPlusMobileUrlBarHeight: number;
    private static readonly DEBOUNCE_DURATION: number = 150;

    public constructor(debounceService: DebounceService) {
        super();

        this._debounceService = debounceService;
    }

    public setupImmediate(): void {
        this._footerButtonElement = document.getElementById('page-footer-button');
    }

    public enabled(): boolean {
        // Footer always exists
        return true;
    }

    public setupOnDomContentLoaded(): void {
    }

    public setupOnLoad(): void {
        const documentElementResizeObserver = new ResizeObserver(this.updateViewportPlusMobileUrlBarHeight);
        documentElementResizeObserver.observe(document.documentElement);

        // TODO one of the main reasons for using ResizeObserver is that it provides dimensions so layouts can be avoided - https://developers.google.com/web/updates/2016/10/resizeobserver
        // Utilize those values.
        const bodyResizeObserver = new ResizeObserver(this._debounceService.createTimeoutDebounceFunction(this.setBackToTopButtonVisibility, PageFooterComponent.DEBOUNCE_DURATION));
        bodyResizeObserver.observe(document.body);
    }

    private updateViewportPlusMobileUrlBarHeight = (): void => {
        let overlayElementStyle = getComputedStyle(document.getElementById('overlay'));
        this._viewportPlusMobileUrlBarHeight = parseFloat(overlayElementStyle.height);
    }

    private setBackToTopButtonVisibility = (): void => {
        let visible = this._footerButtonElement.classList.contains('visible');

        // This is a hack for getting around android chrome and ios safari url bars.
        // - 100vh corresponds to the viewport height + the url bar height on both and is fixed - https://developers.google.com/web/updates/2016/12/url-bar-resizing.
        // - If body.offsetHeight is === (viewport height + url bar height), there will be no vertical scrollbar (if user attempts to scroll, url bar will scroll out). 
        // 100vh can only be obtained in js by setting an element's height to 100vh and retrieving its height through its computed style, this is done in updateViewportPlusMobileUrlBarHeight.
        let pageScrollable = document.body.offsetHeight > this._viewportPlusMobileUrlBarHeight;

        if (!visible && pageScrollable) {
            this._footerButtonElement.classList.add('visible');
        } else if (visible && !pageScrollable) {
            this._footerButtonElement.classList.remove('visible');
        }
    }
}
