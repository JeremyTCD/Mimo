class ListItemService {
    public generateMultiLevelList(items: ListItem[], classes: string, level: number) {
        let numItems = items.length;
        if (numItems === 0) {
            return;
        }

        let ulElement = document.createElement('ul');

        ulElement.setAttribute('class', `level${level} ${classes || ''}`);

        for (let i = 0; i < numItems; i++) {
            let item = items[i];
            let liElement = document.createElement('li');

            liElement.appendChild(item.element);

            if (item.items) {
                let childUl = this.generateMultiLevelList(item.items, classes, level + 1) as HTMLElement;

                if (childUl) {
                    liElement.appendChild(childUl);
                }
            }

            ulElement.appendChild(liElement);
        }

        return ulElement;
    }

    public generateListItemTree(elements: HTMLElement[] | NodeList,
        tags: string[],
        wrapper: HTMLElement,
        tagIndex: number): ListItem {
        let element: HTMLElement = elements[0] as HTMLElement;
        let newElement: HTMLElement = wrapper.cloneNode() as HTMLElement;

        // These span elements are necessary for animated underlines, quite a hacky solution tho
        let spanElement1: HTMLElement = document.createElement('span');
        let spanElement2: HTMLElement = spanElement1.cloneNode() as HTMLElement;
        spanElement1.innerHTML = (element).innerHTML; 
        spanElement2.appendChild(spanElement1);

        newElement.appendChild(spanElement2);
        if (wrapper.tagName === 'A') {
            newElement.setAttribute('href', `#${element.id}`);
        }
        let result: ListItem = {
            element: newElement,
            items: []
        };

        let branch: HTMLElement[] = [];

        for (let i = 1; i <= elements.length; i++) {
            // Iterate till next element of equivalent tag (or end of elements) then backtrack and build branch
            if (i === elements.length || elements[i].nodeName.toLowerCase() === tags[tagIndex]) {
                if (branch.length > 0) {
                    result.
                        items.
                        push(this.generateListItemTree(branch, tags, wrapper, tagIndex + 1));
                }
                branch = [];
            }

            branch.push(elements[i] as HTMLElement);
        }

        return result;
    }
}

export default new ListItemService();