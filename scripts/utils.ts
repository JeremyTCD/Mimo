export function getAbsolutePath(href: string): string {
    // Use anchor to normalize href
    let anchor = $('<a href="' + href + '"></a>')[0] as HTMLAnchorElement;
    // Ignore protocal, remove search and query
    return anchor.host + anchor.pathname;
}

export function isRelativePath(href: string): boolean {
    return !isAbsolutePath(href);
}

export function isAbsolutePath(href: string): boolean {
    return (/^(?:[a-z]+:)?\/\//i).test(href);
}

export function getDirectory(href: string): string {
    if (!href)
        return '';
    let index = href.lastIndexOf('/');
    if (index == -1)
        return '';
    if (index > -1) { 
        return href.substr(0, index);
    }
}

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
