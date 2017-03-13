export function mediaWidthNarrow(): boolean {
    return window.matchMedia('(max-width: 768px)').matches;
}

export function mediaWidthWide(): boolean {
    return window.matchMedia('(min-width: 1025px)').matches;
}
