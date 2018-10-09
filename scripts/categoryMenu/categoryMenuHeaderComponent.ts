import { injectable } from 'inversify';
import Component from '../shared/component';
import TreeService from '../shared/treeService';

@injectable()
export default class CategoryMenuHeaderComponent implements Component {
    private _treeService: TreeService;

    private _headerElement: HTMLElement;
    private _breadcrumbs: TreeNode[] = [];

    public constructor(treeService: TreeService) {
        this._treeService = treeService;
    }

    public setupOnDomContentLoaded(): void {
        this._headerElement = document.getElementById('category-menu-header');
    }

    public setupImmediate(): void {
    }

    public setupOnLoad(): void {
    }

    public loadChildBreadcrumbs(elements: HTMLElement[]): void {
        for (let i = elements.length - 1; i >= 0; i--) {
            let element = elements[i];
            let clone = element.cloneNode(true) as HTMLElement;
            let wrapper: HTMLElement;

            clone.removeChild(clone.querySelector('svg'));
            clone.setAttribute('style', '');

            // Wrap anchors so animated underline works
            if (clone.tagName === 'A') {
                wrapper = document.createElement('span');
                wrapper.appendChild(clone);
            }

            this._breadcrumbs.push({
                element: wrapper || clone,
                items: null
            });
        }

        this.insertBreadcrumbs();
    }

    private insertBreadcrumbs() {
        let ulElement = this._treeService.generateListFromTrees(this._breadcrumbs, 'breadcrumb', 1);
        this._headerElement.insertBefore(ulElement, this._headerElement.childNodes[0]);
    }
}
