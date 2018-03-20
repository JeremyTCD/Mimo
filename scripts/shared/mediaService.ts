import { injectable, inject } from 'inversify';
import { MediaWidth } from './mediaWidth';

@injectable()
export default class MediaService {
    private mediaWidth: MediaWidth;
    private previousMediaWidth: MediaWidth;

    public constructor() {
        // TODO this must be registered before other resize listeners since they use media service to ascertain window width
        // Figure out a systematic way to ensure that this is the case
        window.addEventListener('resize', this.resizeListener);
        this.resizeListener();
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