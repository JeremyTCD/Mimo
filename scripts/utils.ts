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

export function generateMultiLevelList(items: ListItem[], classes: string, level: number) {
    let numItems = items.length;
    let html = '<ul class="level' + level + ' ' + (classes || '') + '">';

    for (let i = 0; i < numItems; i++) {
        let item = items[i];
        let href = item.href;
        let innerHtml = item.innerHtml;

        html += href ? '<li><a href="' + href + '">' + innerHtml + '</a>' : '<li>' + innerHtml;
        html += item.items ? generateMultiLevelList(item.items, classes, level + 1) : '';
        html += '</li>';
    }
    html += '</ul>';
    return html;
}

export function generateListItemTree(elements: HTMLElement[], tags: string[], tagIndex: number): ListItem {
    let result: ListItem = {
        innerHtml: `<span class="icon"></span>
                    <span>${elements[0].textContent}</span>`,
        href: '#' + elements[0].id,
        items: []
    };

    let branch: HTMLElement[] = [];

    for (let i = 1; i <= elements.length; i++) {
        if (i === elements.length || elements[i].nodeName.toLowerCase() === tags[tagIndex]) {
            if (branch.length > 0) {
                result.
                    items.
                    push(generateListItemTree(branch, tags, tagIndex + 1));
            }
            branch = [];
        }

        branch.push(elements[i]);
    }

    return result;
}

export interface ListItem {
    href: string;
    innerHtml: string;
    items: ListItem[];
}

export function toggleHeightForTransition(toggleHeightElement: JQuery, toggleClassElement: JQuery) {
    toggleHeightElement.off('transitionend');
    let initialHeight = toggleHeightElement.height();

    if (toggleClassElement.hasClass('expanded')) {
        toggleHeightElement.css('height', initialHeight);
        //trigger layout
        toggleHeightElement[0].clientHeight;
        toggleHeightElement.css('height', 0);
    } else {
        toggleHeightElement.css('height', 'auto');
        let expandedHeight = toggleHeightElement.height();

        toggleHeightElement.css('height', initialHeight);
        //trigger layout
        toggleHeightElement[0].clientHeight;
        toggleHeightElement.css('height', expandedHeight);

        toggleHeightElement.one('transitionend', () => {
            toggleHeightElement.css('height', 'auto');
        });
    }

    $(toggleClassElement).toggleClass('expanded');
}

export function contractHeightWithoutTransition(toggleHeightElement: JQuery, toggleClassElement: JQuery) {
    if (toggleClassElement.hasClass('expanded')) {
        toggleHeightElement.off('transitionend');
        toggleHeightElement.css('height', 0);
        $(toggleClassElement).removeClass('expanded');
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
