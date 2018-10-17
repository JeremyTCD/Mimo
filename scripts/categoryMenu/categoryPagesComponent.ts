import { injectable } from 'inversify';

import Component from '../shared/component';
import CollapsibleMenu from '../shared/collapsibleMenu';
import CollapsibleMenuFactory from '../shared/collapsibleMenuFactory';
import HeightService from '../shared/heightService';

@injectable()
export default class CategoryPagesComponent implements Component {
    private _categoryPagesElement: HTMLElement;

    public collapsibleMenu: CollapsibleMenu;
    private _collapsibleMenuFactory: CollapsibleMenuFactory;
    private _heightService: HeightService;

    public constructor(
        collapsibleMenuFactory: CollapsibleMenuFactory,
        heightService: HeightService) {

        this._collapsibleMenuFactory = collapsibleMenuFactory;
        this._heightService = heightService;
    }

    public setupImmediate(): void {
    }

    public setupOnDomContentLoaded(): void {
        this._categoryPagesElement = document.getElementById('category-pages');
        this.collapsibleMenu = this._collapsibleMenuFactory.build(this._categoryPagesElement);
    }

    public setupOnLoad(): void {
        this.expandInitiallyExpandedLIElements();
    }

    private expandInitiallyExpandedLIElements(): void {
        let activePageElement = this._categoryPagesElement.querySelector('.active');

        // Page may not be listed in category menu
        if (!activePageElement) {
            return;
        }

        let currentElement = activePageElement.parentElement;
        let initiallyExpandedLIElements = [];
        while (currentElement != this._categoryPagesElement) {
            if (currentElement.tagName === 'LI' && currentElement.classList.contains('expandable')) {
                initiallyExpandedLIElements.push(currentElement);
            }

            currentElement = currentElement.parentElement;
        }

        // There may be no LI elements to expand
        if (initiallyExpandedLIElements.length == 0) {
            return;
        }

        // If an element is nested in another element and a height transition is started for both at the same
        // time, the outer element only transitions to its height. This is because 
        // toggleHeightForTransition has no way to know the final heights of an element's children. Nested children at
        // the bottom of the outer element are only revealed when its height is set to auto in its transitionend callback.
        // Therefore it is necessary to immediately expand nested elements.
        for (let i = 0; i < initiallyExpandedLIElements.length; i++) {
            let listElement = initiallyExpandedLIElements[i];

            if (i === initiallyExpandedLIElements.length - 1) {
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
}
