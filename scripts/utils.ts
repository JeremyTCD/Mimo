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
        let name = item.name;

        html += href ? '<li><a href="' + href + '">' + name + '</a>' : '<li>' + name;
        html += item.items ? generateMultiLevelList(item.items, classes, ++level) : '';
        html += '</li>';
    }
    html += '</ul>';
    return html;
}

export interface ListItem {
    href: string;
    name: string;
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

        toggleHeightElement.on('transitionend', () => {
            toggleHeightElement.css('height', 'auto');
        });
    }

    $(toggleClassElement).toggleClass('expanded');
}