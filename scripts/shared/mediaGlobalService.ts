import { injectable, inject } from 'inversify';
import { MediaWidth } from './mediaWidth';
import GlobalService from '../shared/globalService';

@injectable()
export default class MediaGlobalService implements GlobalService {
    private mediaWidth: MediaWidth;
    private previousMediaWidth: MediaWidth;

    public setupImmediate(): void {
        window.addEventListener('resize', this.resizeListener);
        this.resizeListener();
    }

    public setupOnDomContentLoaded(): void {

    }

    public setupOnLoad(): void {

    }

    private resizeListener = () => {
        this.previousMediaWidth = this.mediaWidth;

        if (window.matchMedia('(max-width: 855px)').matches) {
            this.mediaWidth = MediaWidth.narrow;
        } else if (window.matchMedia('(min-width: 1184px)').matches) {
            this.mediaWidth = MediaWidth.wide;
        } else {
            this.mediaWidth = MediaWidth.medium;
        }
    }

    public mediaWidthNarrow(): boolean {
        return this.mediaWidth === MediaWidth.narrow;
    }

    public mediaWidthMedium(): boolean {
        return this.mediaWidth === MediaWidth.medium;
    }

    public mediaWidthWide(): boolean {
        return this.mediaWidth === MediaWidth.wide;
    }

    public mediaWidthChanged(): boolean {
        return this.mediaWidth !== this.previousMediaWidth;
    }

    public getPreviousMediaWidth(): MediaWidth {
        return this.previousMediaWidth;
    }
}