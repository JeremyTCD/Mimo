import { injectable, inject, named } from 'inversify';
import Component from '../shared/component';
import TreeService from '../shared/treeService';
import '../shared/treeNode';
import './tableOfContentsAnchorData';
import ArticleGlobalService from '../shared/articleGlobalService';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';

@injectable()
export default class TableOfContentsComponent implements Component {
    private _wrapperElement: HTMLElement;
    private _tableOfContentsElement: HTMLElement;
    private _knobElement: HTMLElement;
    private _rootUnorderedListElement: HTMLElement;

    private _articleGlobalService: ArticleGlobalService;
    private _mediaGlobalService: MediaGlobalService;
    private _treeService: TreeService;

    private _anchorElements: NodeList;
    private _anchorHashes: string[];
    private _lastDropdownAnchorIndex: number;
    private _noToc: boolean;

    public constructor(treeService: TreeService,
        @inject('GlobalService') @named('ArticleGlobalService') articleGlobalService: ArticleGlobalService,
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService) {

        this._treeService = treeService;
        this._articleGlobalService = articleGlobalService;
        this._mediaGlobalService = mediaGlobalService;
    }

    public setupImmediate(): void {
    }

    public setupOnDomContentLoaded(): void {
        this._wrapperElement = document.getElementById('table-of-contents-wrapper');
        this._tableOfContentsElement = document.getElementById('table-of-contents');
        this._knobElement = document.getElementById('table-of-contents-indicator-knob');

        this.insertElements();
        if (!this._noToc) {
            this._rootUnorderedListElement = this._tableOfContentsElement.querySelector('ul');
            this._anchorElements = this._rootUnorderedListElement.querySelectorAll('a');
        }
    }

    public setupOnLoad(): void {
        if (!this._noToc) {
            this._mediaGlobalService.addChangedToListener(this.onChangedToNarrowListener, MediaWidth.narrow);
            this._mediaGlobalService.addChangedFromListener(this.onChangedFromNarrowListener, MediaWidth.narrow);
        }
    }

    private onChangedToNarrowListener = (init: boolean): void => {
        if (!init) {
            this._articleGlobalService.removeIndexChangedListener(this.updateSideMenuKnob);
        }
    }

    private onChangedFromNarrowListener = (init: boolean): void => {
        this._articleGlobalService.addIndexChangedListener(this.updateSideMenuKnob, true);
    }

    public updateDropdownKnob = (): void => {
        if (!this._noToc) {
            let newIndex = this._articleGlobalService.getActiveHeaderIndex();

            if (newIndex === this._lastDropdownAnchorIndex) {
                return;
            }

            if (this._lastDropdownAnchorIndex !== null && this._lastDropdownAnchorIndex !== undefined) {
                (this._anchorElements[this._lastDropdownAnchorIndex] as HTMLElement).classList.remove('active');
            }

            let activeAnchorIndex = newIndex === -1 ? 0 : newIndex;
            (this._anchorElements[activeAnchorIndex] as HTMLElement).classList.add('active');
            this._lastDropdownAnchorIndex = activeAnchorIndex;
        }
    }

    private updateSideMenuKnob = (newIndex: number): void => {
        let activeAnchorIndex = newIndex === -1 ? 0 : newIndex;
        let activeAnchorElement = this._anchorElements[activeAnchorIndex] as HTMLElement;
        let anchorBoundingRect = activeAnchorElement.getBoundingClientRect();
        let translateY = anchorBoundingRect.top - this._tableOfContentsElement.getBoundingClientRect().top + this._tableOfContentsElement.scrollTop;

        this._knobElement.style.transform = `translateY(${translateY}px) scaleY(${anchorBoundingRect.height})`;
    }

    private insertElements(): void {
        let articleHeaderElements = this._articleGlobalService.getHeaderElements();
        let tableOfContentsTitleSpanElement = document.querySelector('#table-of-contents-title span');
        let articleTitleElement = document.querySelector('.jtcd-article > .title');
        let tableOfContentsTitle = articleTitleElement ? articleTitleElement.textContent : 'Outline';

        tableOfContentsTitleSpanElement.innerHTML = tableOfContentsTitle;

        if (articleHeaderElements.length === 0) {
            this._noToc = true;
            this._tableOfContentsElement.style.display = "none"

            return;
        }
        this._noToc = false;

        let listItemTrees: TreeNode[] = this._treeService.generateTrees(
            articleHeaderElements,
            ['header-1', 'header-2'],
            document.createElement('a'));
        let ulElement: HTMLUListElement = this._treeService.generateListFromTrees(listItemTrees, '', 1);

        // Insert divs for use as indicator tracks
        let indicatorTrackDiv: HTMLElement = document.createElement('div');
        indicatorTrackDiv.classList.add('indicator-track');
        for (let i = 0; i < ulElement.children.length; i++) {
            let level1LIElement = ulElement.children[i];
            level1LIElement.insertBefore(indicatorTrackDiv.cloneNode(), level1LIElement.firstElementChild);
        }

        this._tableOfContentsElement.appendChild(ulElement);
    }

    public getAnchorElements(): NodeList {
        return this._anchorElements;
    }
}