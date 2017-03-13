export function htmlEncode(value: string): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function htmlDecode(value: string): string {
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

export function mediaWidthNarrow(): boolean {
    return window.matchMedia('(max-width: 768px)').matches;
}

export function mediaWidthWide(): boolean {
    return window.matchMedia('(min-width: 1025px)').matches;
}
