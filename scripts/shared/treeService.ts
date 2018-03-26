import { injectable, inject } from 'inversify';

@injectable()
export default class TreeService {
    public generateListFromTrees(items: TreeNode[], classes: string, level: number): HTMLUListElement {
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
                let childUl = this.generateListFromTrees(item.items, classes, level + 1) as HTMLElement;

                if (childUl) {
                    liElement.appendChild(childUl);
                }
            }

            ulElement.appendChild(liElement);
        }

        return ulElement;
    }

    // If elements have no root node (multiple trees)
    public generateTrees(headerElements: HTMLElement[] | NodeList,
        classNames: string[],
        wrapper: HTMLElement) : TreeNode[]{

        let result: TreeNode[] = [];
        let branch: HTMLElement[] = [];

        for (let i = 0; i <= headerElements.length; i++) {
            // Iterate till next element of with same class (or end of elements) then backtrack and build branch
            if (i === headerElements.length || (headerElements[i] as HTMLElement).classList.contains(classNames[0])) {
                if (branch.length > 0) {
                    result.
                        push(this.generateTree(branch, classNames, wrapper, 1));
                }
                branch = [];
            }

            branch.push(headerElements[i] as HTMLElement);
        }

        return result;
    }

    public generateTree(headerElements: HTMLElement[] | NodeList,
        classNames: string[],
        wrapper: HTMLElement,
        tagIndex: number): TreeNode {

        let rootHeaderElement: HTMLElement = headerElements[0] as HTMLElement;
        let newElement: HTMLElement = wrapper.cloneNode() as HTMLElement;

        // This span element is necessary for animated underlines, quite a hacky solution tho
        let spanElement: HTMLElement = document.createElement('span');
        spanElement.innerHTML = rootHeaderElement.querySelector('h1, h2').innerHTML; 

        newElement.appendChild(spanElement);
        if (wrapper.tagName === 'A') {
            newElement.setAttribute('href', `#${rootHeaderElement.id}`);
        }
        let result: TreeNode = {
            element: newElement,
            items: []
        };

        let branch: HTMLElement[] = [];

        for (let i = 1; i <= headerElements.length; i++) {
            // Iterate till next element of equivalent tag (or end of elements) then backtrack and build branch
            if (i === headerElements.length || (headerElements[i] as HTMLElement).classList.contains(classNames[tagIndex])) {
                if (branch.length > 0) {
                    result.
                        items.
                        push(this.generateTree(branch, classNames, wrapper, tagIndex + 1));
                }
                branch = [];
            }

            branch.push(headerElements[i] as HTMLElement);
        }

        return result;
    }
}