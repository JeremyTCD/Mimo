import { injectable } from 'inversify';
import { MediaWidth } from './mediaWidth';
import GlobalService from '../shared/globalService';

@injectable()
export default class MediaGlobalService implements GlobalService {
    private _mediaWidth: MediaWidth;
    private _previousMediaWidth: MediaWidth;

    private _narrowMediaQueryList: MediaQueryList;
    private _wideMediaQueryList: MediaQueryList;

    private _onMediaWidthChangeListeners: ((init: boolean) => void)[][];

    public setupImmediate(): void {
        this._narrowMediaQueryList = window.matchMedia('(max-width: 1112px)');
        this._wideMediaQueryList = window.matchMedia('(min-width: 1494px)');

        this.updateMediaWidth();

        this._onMediaWidthChangeListeners = [];
        // TODO cleaner way to get number of listener arrays (in case more media widths are added)
        for (let i = 0; i <= MediaWidth.wide * 2 + 1; i++) {
            this._onMediaWidthChangeListeners[i] = [];
        }

        window.addEventListener('resize', this.onResizeListener);
    }

    public setupOnDomContentLoaded(): void {

    }

    public setupOnLoad(): void {

    }

    private updateMediaWidth = (): boolean => {
        let newMediaWidth = MediaWidth.medium;

        if (this._narrowMediaQueryList.matches) {
            newMediaWidth = MediaWidth.narrow;
        } else if (this._wideMediaQueryList.matches) {
            newMediaWidth = MediaWidth.wide;
        }

        if (newMediaWidth !== this._mediaWidth) {
            this._previousMediaWidth = this._mediaWidth;
            this._mediaWidth = newMediaWidth;

            return true;
        }

        return false;
    }

    // MediaQueryLists fire their listeners when their match status changes. Chrome and firefox both fire the listeners before the corresponding resize event. However, edge fires the listeners after the 
    // corresponding resize event. Therefore, MediaGlobalService cannot depend on MediaQueryList listeners to update _mediaWidth.
    private onResizeListener = () => {
        if (this.updateMediaWidth()) {
            let changeFromListeners = this._onMediaWidthChangeListeners[this._previousMediaWidth * 2 + 1];
            for (let i = 0; i < changeFromListeners.length; i++) {
                changeFromListeners[i](false);
            }

            let changeToListeners = this._onMediaWidthChangeListeners[this._mediaWidth * 2];
            for (let i = 0; i < changeToListeners.length; i++) {
                changeToListeners[i](false);
            }
        }
    }

    public addChangedToListener(listener: (init: boolean) => void, mediaWidth: MediaWidth) {
        let listeners = this._onMediaWidthChangeListeners[mediaWidth * 2];

        listeners.push(listener);

        if (this._mediaWidth === mediaWidth) {
            listener(true);
        }
    }

    public addChangedFromListener(listener: (init: boolean) => void, mediaWidth: MediaWidth) {
        let listeners = this._onMediaWidthChangeListeners[mediaWidth * 2 + 1];

        listeners.push(listener);

        if (this._mediaWidth !== mediaWidth) {
            listener(true);
        }
    }

    public mediaWidthIs(mediaWidth: MediaWidth): boolean {
        return this._mediaWidth === mediaWidth;
    }

    public mediaWidthChanged(): boolean {
        return this._mediaWidth !== this._previousMediaWidth;
    }

    public getPreviousMediaWidth(): MediaWidth {
        return this._previousMediaWidth;
    }
}