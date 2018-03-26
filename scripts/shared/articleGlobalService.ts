import { injectable, inject } from 'inversify';
import ResizeObserver from 'resize-observer-polyfill';
import MediaService from '../shared/mediaService';
import DebounceService from '../shared/debounceService';
import GlobalService from './globalService';

@injectable()
export default class ArticleGlobalService implements GlobalService {
    private _activeHeaderIndex: number;
    private _lastActiveHeaderIndex: number;
    private _mediaService: MediaService;
    private _debounceService: DebounceService;

    // TODO should be readonly
    private _headerElements: NodeList;
    private _bodyResizeObserver: ResizeObserver;
    private _headerTops: number[];
    private _updateHistoryDebounced: () => void;

    public constructor(mediaService: MediaService,
        debounceService: DebounceService) {
        this._mediaService = mediaService;
        this._debounceService = debounceService;
        console.log('ags constructor');
    }

    public setupOnDomContentLoaded(): void {
    }

    public setupImmediate(): void {
        this._headerElements = document.querySelectorAll('.jtcd-article .header-1, .jtcd-article .header-2');

        this._bodyResizeObserver = new ResizeObserver(this.onResizeListener);
        this._headerTops = [];
        this._updateHistoryDebounced = this._debounceService.createTimeoutDebounceFunction(this.updateHistory, 100);
    }

    public setupOnLoad(): void {
        // Triggers initial calls to updateHeaderTops, updateActiveHeaderIndex and updateHistory
        this._bodyResizeObserver.observe(document.body);

        window.addEventListener('scroll', this.onScrollListener);
        window.addEventListener('resize', this.onResizeListener);
    }

    public onScrollListener = (): void => {
        this.updateActiveHeaderIndex();
        this._updateHistoryDebounced();
    }

    public onResizeListener = (): void => {
        this.updateHeaderTops();
        this.updateActiveHeaderIndex();
        this._updateHistoryDebounced();
    }

    private updateActiveHeaderIndex(): void {
        let windowScrollY = window.scrollY;

        this._lastActiveHeaderIndex = this._activeHeaderIndex;

        for (let i = 0; i < this._headerTops.length; i++) {
            if (windowScrollY < this._headerTops[i]) {
                this._activeHeaderIndex = i - 1;
                return;
            }
        }

        this._activeHeaderIndex = this._headerTops.length - 1;
    }

    private updateHeaderTops(): void {
        // When screen is narrow, fixed header occupies 37px at top of screen
        let headerHeight = this._mediaService.mediaWidthNarrow() ? 37 : 0;
        let windowScrollY = window.scrollY;

        for (let i = 0; i < this._headerElements.length; i++) {
            let headerElement = this._headerElements[i] as HTMLHeadingElement;
            let marginTop = parseFloat(getComputedStyle(headerElement).marginTop);
            let elementDistanceFromTop = headerElement.getBoundingClientRect().top - marginTop + windowScrollY - headerHeight;

            this._headerTops.push(elementDistanceFromTop);
        }
    }

    public getActiveHeaderIndex(): number {
        return this._activeHeaderIndex;
    }

    public getHeaderElements(): NodeList {
        return this._headerElements;
    }

    private updateHistory = (): void => {
        let id = null;

        if (this._activeHeaderIndex > -1) {
            id = (this._headerElements[this._activeHeaderIndex] as HTMLElement).getAttribute('id');
        }

        history.replaceState(null, null, id ? `#${id}` : location.pathname);
    }
}
