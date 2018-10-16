import { injectable } from 'inversify';

import Component from '../shared/component';
import CollapsibleMenu from '../shared/collapsibleMenu';
import CollapsibleMenuFactory from '../shared/collapsibleMenuFactory';
import SvgService from '../shared/svgService';
import PathService from '../shared/pathService';
import CategoryMenuHeaderComponent from './categoryMenuHeaderComponent';
import HeightService from '../shared/heightService';

@injectable()
export default class CategoryPagesComponent implements Component {
    private _categoryPagesElement: HTMLElement;

    private _categoryMenuHeaderComponent: CategoryMenuHeaderComponent;

    public  collapsibleMenu: CollapsibleMenu;
    private _collapsibleMenuFactory: CollapsibleMenuFactory;
    private _svgService: SvgService;
    private _heightService: HeightService;
    private _pathService: PathService;
    private _initiallyExpandedLIElements: HTMLElement[];
    private _initialExpandLIElementsPending: boolean;

    public constructor(
        categoryMenuHeaderComponent: CategoryMenuHeaderComponent,
        collapsibleMenuFactory: CollapsibleMenuFactory,
        svgService: SvgService,
        pathService: PathService,
        heightService: HeightService) {

        this._categoryMenuHeaderComponent = categoryMenuHeaderComponent;
        this._collapsibleMenuFactory = collapsibleMenuFactory;
        this._svgService = svgService;
        this._pathService = pathService;
        this._heightService = heightService;
    }

    public setupImmediate(): void {
    }

    public setupOnDomContentLoaded(): void {
        this._categoryPagesElement = document.getElementById('category-pages');

        let categoryPagesPath = document.
            querySelector("meta[property='docfx\\:tocrel']").
            getAttribute("content").
            replace(/\\/g, '/');

        let getCategoryPagesRequest = new XMLHttpRequest()
        getCategoryPagesRequest.onreadystatechange = () => {
            // TODO check status too
            if (getCategoryPagesRequest.readyState === XMLHttpRequest.DONE) {
                let categoryPagesFragment = document.createRange().createContextualFragment(getCategoryPagesRequest.responseText);
                let svgElement: SVGElement = this._svgService.createSvgExternalSpriteElement('material-design-chevron-right');
                let items = categoryPagesFragment.querySelectorAll('li > a, li > span');

                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    item.insertBefore(svgElement.cloneNode(true), item.firstChild);
                }

                this._categoryPagesElement.appendChild(categoryPagesFragment);
                let activePageElement = this.cleanHrefsAndGetActivePageElement(categoryPagesPath);
                this.collapsibleMenu = this._collapsibleMenuFactory.build(this._categoryPagesElement);
                this.handleActivePageElement(activePageElement);

                // load event has already fired
                if (document.readyState === 'complete') {
                    this.expandInitiallyExpandedLIElements(this._initiallyExpandedLIElements);
                } else {
                    this._initialExpandLIElementsPending = true;
                }
            }
        }
        getCategoryPagesRequest.open('GET', categoryPagesPath);
        getCategoryPagesRequest.send();
    }

    public setupOnLoad(): void {
        if (this._initialExpandLIElementsPending) {
            this.expandInitiallyExpandedLIElements(this._initiallyExpandedLIElements);
        }
    }

    private handleActivePageElement(activePageElement: HTMLElement) {
        // Page may not be listed in category menu
        if (!activePageElement) {
            return;
        }

        let parentTopicAndPageElements: HTMLElement[] = [];
        let currentParentElement = activePageElement.parentElement;

        this._initiallyExpandedLIElements = [];
        activePageElement.classList.add('active');

        while (currentParentElement.id !== 'category-pages') {
            if (currentParentElement.tagName === 'LI') {
                parentTopicAndPageElements.
                    push(currentParentElement.querySelector('a, span'));

                if (currentParentElement.classList.contains('expandable')) {
                    this._initiallyExpandedLIElements.push(currentParentElement);
                }
            }

            currentParentElement = currentParentElement.parentElement;
        }

        this.
            _categoryMenuHeaderComponent.
            loadChildBreadcrumbs(parentTopicAndPageElements);
    }

    private expandInitiallyExpandedLIElements(liElements: HTMLElement[]): void {
        // There may be no LI elements to expand
        if (!liElements) {
            return;
        }

        // If an element is nested in another element and a height transition is started for both at the same
        // time, the outer element only transitions to its height. This is because 
        // toggleHeightForTransition has no way to know the final heights of an element's children. Nested children at
        // the bottom of the outer element are only revealed when its height is set to auto in its transitionend callback.
        // Therefore it is necessary to immediately expand nested elements.
        for (let i = 0; i < liElements.length; i++) {
            let listElement = liElements[i];

            if (i === liElements.length - 1) {
                this._heightService.toggleHeightWithTransition(listElement.querySelector('ul'), listElement);
            }
            else {
                this._heightService.expandHeightWithoutTransition(listElement.querySelector('ul'), listElement);
            }

            // TODO generalize and move to edgeWorkaroundsService
            // Yet another Edge workaround - 
            // On page load, Edge does not rotate the svg until mouse hovers over the li element it is contained in.
            // This is a really dirty temporary fix that forces the rotation.
            let svgElement = listElement.firstElementChild.firstElementChild as SVGSVGElement;
            svgElement.style.transform = 'rotate(90deg)';
            svgElement.style.transform = '';
        }
    }

    private cleanHrefsAndGetActivePageElement(categoryPagesPath: string): HTMLElement {
        let indexOfLastSlashBeforeFileName = categoryPagesPath.lastIndexOf('/');
        let categoryPagesRelativePath = '';
        if (indexOfLastSlashBeforeFileName > -1) {
            categoryPagesRelativePath = categoryPagesPath.substr(0, indexOfLastSlashBeforeFileName + 1);
        }
        let currentUri = this._pathService.getAbsolutePath(window.location.pathname);
        let pageElements = this._categoryPagesElement.querySelectorAll('a');

        for (let i = 0; i < pageElements.length; i++) {
            let pageElement = pageElements[i];

            let pageHref = pageElement.getAttribute("href");
            if (this._pathService.isRelativePath(pageHref)) {
                // Make href relative to current URI
                pageHref = categoryPagesRelativePath + pageHref;
                pageElement.setAttribute("href", pageHref);
            }

            if (this._pathService.getAbsolutePath(pageElement.href) === currentUri) {
                return pageElement;
            }
        }
    }
}
