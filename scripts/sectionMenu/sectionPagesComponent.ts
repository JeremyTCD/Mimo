import { injectable } from 'inversify';

import Component from '../shared/component';
import CollapsibleMenu from '../shared/collapsibleMenu';
import CollapsibleMenuFactory from '../shared/collapsibleMenuFactory';
import SvgService from '../shared/svgService';
import PathService from '../shared/pathService';
import SectionMenuHeaderComponent from './sectionMenuHeaderComponent';
import HeightService from '../shared/heightService';

@injectable()
export default class SectionPagesComponent implements Component {
    private _sectionPagesElement: HTMLElement;

    private _sectionMenuHeaderComponent: SectionMenuHeaderComponent;

    public  collapsibleMenu: CollapsibleMenu;
    private _collapsibleMenuFactory: CollapsibleMenuFactory;
    private _svgService: SvgService;
    private _heightService: HeightService;
    private _pathService: PathService;
    private _initiallyExpandedLIElements: HTMLElement[];
    private _initialExpandLIElementsPending: boolean;

    public constructor(
        sectionMenuHeaderComponent: SectionMenuHeaderComponent,
        collapsibleMenuFactory: CollapsibleMenuFactory,
        svgService: SvgService,
        pathService: PathService,
        heightService: HeightService) {

        this._sectionMenuHeaderComponent = sectionMenuHeaderComponent;
        this._collapsibleMenuFactory = collapsibleMenuFactory;
        this._svgService = svgService;
        this._pathService = pathService;
        this._heightService = heightService;
    }

    public setupImmediate(): void {
    }

    public setupOnDomContentLoaded(): void {
        this._sectionPagesElement = document.getElementById('section-pages');

        let sectionPagesPath = document.
            querySelector("meta[property='docfx\\:tocrel']").
            getAttribute("content").
            replace(/\\/g, '/');

        let getSectionPagesRequest = new XMLHttpRequest()
        getSectionPagesRequest.onreadystatechange = () => {
            // TODO check status too
            if (getSectionPagesRequest.readyState === XMLHttpRequest.DONE) {
                let sectionPagesFragment = document.createRange().createContextualFragment(getSectionPagesRequest.responseText);
                let svgElement: SVGElement = this._svgService.createSvgExternalSpriteElement('material-design-chevron-right');
                let items = sectionPagesFragment.querySelectorAll('li > a, li > span');

                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    item.insertBefore(svgElement.cloneNode(true), item.firstChild);
                }

                this._sectionPagesElement.appendChild(sectionPagesFragment);
                let activePageElement = this.cleanHrefsAndGetActivePageElement(sectionPagesPath);
                this.collapsibleMenu = this._collapsibleMenuFactory.build(this._sectionPagesElement);
                this.handleActivePageElement(activePageElement);

                // load event has already fired
                if (document.readyState === 'complete') {
                    this.expandInitiallyExpandedLIElements(this._initiallyExpandedLIElements);
                } else {
                    this._initialExpandLIElementsPending = true;
                }
            }
        }
        getSectionPagesRequest.open('GET', sectionPagesPath);
        getSectionPagesRequest.send();
    }

    public setupOnLoad(): void {
        if (this._initialExpandLIElementsPending) {
            this.expandInitiallyExpandedLIElements(this._initiallyExpandedLIElements);
        }
    }

    private handleActivePageElement(activePageElement: HTMLElement) {
        // Page may not be listed in section menu
        if (!activePageElement) {
            return;
        }

        let parentTopicAndPageElements: HTMLElement[] = [];
        let currentParentElement = activePageElement.parentElement;

        this._initiallyExpandedLIElements = [];
        activePageElement.classList.add('active');

        while (currentParentElement.id !== 'section-pages') {
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
            _sectionMenuHeaderComponent.
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
                this._heightService.toggleHeightWithTransition($(listElement).children('ul')[0], listElement);
            }
            else {
                this._heightService.expandHeightWithoutTransition($(listElement).children('ul')[0], listElement);
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

    private cleanHrefsAndGetActivePageElement(sectionPagesPath: string): HTMLElement {
        let indexOfLastSlashBeforeFileName = sectionPagesPath.lastIndexOf('/');
        let sectionPagesRelativePath = '';
        if (indexOfLastSlashBeforeFileName > -1) {
            sectionPagesRelativePath = sectionPagesPath.substr(0, indexOfLastSlashBeforeFileName + 1);
        }
        let currentUri = this._pathService.getAbsolutePath(window.location.pathname);
        let pageElements = this._sectionPagesElement.querySelectorAll('a');

        for (let i = 0; i < pageElements.length; i++) {
            let pageElement = pageElements[i];

            let pageHref = pageElement.getAttribute("href");
            if (this._pathService.isRelativePath(pageHref)) {
                // Make href relative to current URI
                pageHref = sectionPagesRelativePath + pageHref;
                pageElement.setAttribute("href", pageHref);
            }

            if (this._pathService.getAbsolutePath(pageElement.href) === currentUri) {
                return pageElement;
            }
        }
    }
}
