class ListItemService {
    public generateMultiLevelList(items: ListItem[], classes: string, level: number) {
        let numItems = items.length;
        let html = '<ul class="level' + level + ' ' + (classes || '') + '">';

        for (let i = 0; i < numItems; i++) {
            let item = items[i];
            let href = item.href;
            let innerHtml = item.innerHtml;

            html += '<li>'
            html += href ? `<a href="${href}">${innerHtml}</a>` : `<span>${innerHtml}</span>`;
            html += item.items ? this.generateMultiLevelList(item.items, classes, level + 1) : '';
            html += '</li>';
        }
        html += '</ul>';
        return html;
    }

    public generateListItemTree(elements: HTMLElement[] | NodeList, tags: string[], tagIndex: number): ListItem {
        let result: ListItem = {
            innerHtml: `<span><span>${elements[0].textContent}</span></span>`, // Outer span required for text content to have an animated underline - see right menu
            href: '#' + (elements[0] as HTMLElement).id,
            items: []
        };

        let branch: HTMLElement[] = [];

        for (let i = 1; i <= elements.length; i++) {
            if (i === elements.length || elements[i].nodeName.toLowerCase() === tags[tagIndex]) {
                if (branch.length > 0) {
                    result.
                        items.
                        push(this.generateListItemTree(branch, tags, tagIndex + 1));
                }
                branch = [];
            }

            branch.push(elements[i] as HTMLElement);
        }

        return result;
    }
}

export default new ListItemService();