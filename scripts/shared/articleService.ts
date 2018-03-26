import { injectable, inject } from 'inversify';
import MediaService from '../shared/mediaService';

@injectable()
export default class ArticleService {
    private _activeHeadingIndex: number;
    private _mediaService: MediaService;

    // TODO should be readonly
    private _headerElements: NodeList;

    public constructor(mediaService: MediaService) {
        this._mediaService = mediaService;
    }

    public setup(): void {
        this._headerElements = document.querySelectorAll('.jtcd-article .header-1, .jtcd-article .header-2');

        window.addEventListener('scroll', this.update);
        window.addEventListener('resize', this.update);
    }

    public update = (): void => {
        this.updateActiveHeadingIndex();
        this.updateHistory();
    }

    private updateActiveHeadingIndex(): void {
        let activeHeadingIndex = -1;
        let minDistance = -1;
        // When screen is narrow, fixed header occupies 37px at top of screen
        let headerHeight = this._mediaService.mediaWidthNarrow() ? 37 : 0;

        // TODO: try binary search instead (profile, despite small number of headings, might be worth the overhead since getBoundingClientRect can be expensive)
        for (let i = 0; i < this._headerElements.length; i++) {
            let headerElement = this._headerElements[i] as HTMLHeadingElement;
            let elementDistanceFromTop = headerHeight - headerElement.getBoundingClientRect().top;

            // Only consider heading wrappers that are above the top of the screen
            if (elementDistanceFromTop < 0) {
                break;
            }

            if (minDistance === -1 || elementDistanceFromTop < minDistance) {
                minDistance = elementDistanceFromTop;
                activeHeadingIndex = i;
            } else {
                break;
            }
        }

        this._activeHeadingIndex = activeHeadingIndex;
    }

    public getActiveHeadingIndex(): number {
        return this._activeHeadingIndex;
    }

    public getHeaderElements(): NodeList {
        return this._headerElements;
    }

    private updateHistory(): void {
        let id = null;

        if (this._activeHeadingIndex > -1) {
            id = (this._headerElements[this._activeHeadingIndex] as HTMLElement).getAttribute('id');
        }

        history.replaceState(null, null, id ? `#${id}` : location.pathname);
    }
}
