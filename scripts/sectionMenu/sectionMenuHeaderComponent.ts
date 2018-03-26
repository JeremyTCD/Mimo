import { injectable, inject } from 'inversify';
import Component from '../shared/component';
import TreeService from '../shared/treeService';

@injectable()
export default class SectionMenuHeaderComponent implements Component {
    private _treeService: TreeService;

    private _headerElement: HTMLElement;
    private _breadcrumbs: TreeNode[] = [];

    private _rootBreadcrumbLoaded: boolean = false;
    private _childBreadcrumbsLoaded: boolean = false;

    public constructor(treeService: TreeService) {
        this._treeService = treeService;
    }

    public setupOnDomContentLoaded(): void {
        this._headerElement = document.getElementById('section-menu-header');
    }

    public setupImmediate(): void {
    }

    public setupOnLoad(): void {
    }

    public registerListeners(): void {
    }

    public loadRootBreadCrumb(anchorElement: HTMLAnchorElement): void {
        if (!this._rootBreadcrumbLoaded) {
            let clone = anchorElement.cloneNode(true) as HTMLElement;
            let wrapper: HTMLElement;

            clone.setAttribute('style', '');

            // Wrap anchors so animated underline works
            if (clone.tagName === 'A') {
                wrapper = document.createElement('span');
                wrapper.appendChild(clone);
            }

            this._breadcrumbs.unshift({
                element: wrapper || clone,
                items: null
            });

            this._rootBreadcrumbLoaded = true;
            if (this._childBreadcrumbsLoaded) {
                this.insertBreadcrumbs();
            }
        }
    }

    public loadChildBreadcrumbs(elements: HTMLElement[]): void {
        if (!this._childBreadcrumbsLoaded) {
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

            this._childBreadcrumbsLoaded = true;
            if (this._rootBreadcrumbLoaded) {
                this.insertBreadcrumbs();
            }
        }
    }

    private insertBreadcrumbs() {
        let ulElement = this._treeService.generateListFromTrees(this._breadcrumbs, 'breadcrumb', 1);
        this._headerElement.insertBefore(ulElement, this._headerElement.childNodes[0]);
    }
}
