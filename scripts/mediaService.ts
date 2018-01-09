class MediaService {
    public mediaWidthNarrow(): boolean {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    public mediaWidthWide(): boolean {
        return window.matchMedia('(min-width: 1025px)').matches;
    }
}

export default new MediaService();