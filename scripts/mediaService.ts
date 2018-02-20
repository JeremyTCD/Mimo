class MediaService {
    private width: Size

    constructor() {
        // TODO this must be registered before other resize listeners since they use media service to ascertain window width
        // Figure out a systematic way to ensure that this is the case
        window.addEventListener('resize', this.resizeListener);
        this.resizeListener();
    }

    private resizeListener = () => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            this.width = Size.narrow;
        } else if (window.matchMedia('(min-width: 1280px)').matches) {
            this.width = Size.wide;
        } else {
            this.width = Size.medium;
        }
    }

    public mediaWidthNarrow(): boolean {
        return this.width === Size.narrow;
    }

    public mediaWidthMedium(): boolean {
        return this.width === Size.medium;
    }

    public mediaWidthWide(): boolean {
        return this.width === Size.wide;
    }
}

enum Size {
    narrow,
    medium,
    wide
}

export default new MediaService();