import { injectable, inject, named } from 'inversify';
import Component from '../shared/component';
import '../shared/treeNode';
import ArticleGlobalService from '../shared/articleGlobalService';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';

@injectable()
export default class OutlineComponent implements Component {
    private _outlineScrollableElement: HTMLElement;
    private _knobElement: HTMLElement;
    private _rootUnorderedListElement: HTMLElement;

    private _articleGlobalService: ArticleGlobalService;
    private _mediaGlobalService: MediaGlobalService;

    private _anchorElements: NodeList;
    private _lastDropdownAnchorIndex: number;

    public constructor(@inject('GlobalService') @named('ArticleGlobalService') articleGlobalService: ArticleGlobalService,
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService) {

        this._articleGlobalService = articleGlobalService;
        this._mediaGlobalService = mediaGlobalService;
    }

    public setupImmediate(): void {
    }

    public setupOnDomContentLoaded(): void {
        this._outlineScrollableElement = document.getElementById('outline-scrollable');
        this._knobElement = document.getElementById('outline-scrollable-knob');
        this._rootUnorderedListElement = document.querySelector('#outline ul');
        this._anchorElements = this._rootUnorderedListElement.querySelectorAll('a');
    }

    public setupOnLoad(): void {
        this._mediaGlobalService.addChangedToListener(this.onChangedToNarrowListener, MediaWidth.narrow);
        this._mediaGlobalService.addChangedFromListener(this.onChangedFromNarrowListener, MediaWidth.narrow);
    }

    private onChangedToNarrowListener = (init: boolean): void => {
        if (!init) {
            this._articleGlobalService.removeActiveSectionChangedListener(this.updateActiveSectionAnchor);
        }
    }

    private onChangedFromNarrowListener = (): void => {
        this._articleGlobalService.addActiveSectionChangedListener(this.updateActiveSectionAnchor, true);
    }

    public updateDropdownKnob = (): void => {
        let newIndex = this._articleGlobalService.getActiveHeaderIndex();
        let activeDropdownAnchorIndex = newIndex === 0 ? 0 : newIndex - 1; // anchor elements does not include level 1 anchor

        if (activeDropdownAnchorIndex === this._lastDropdownAnchorIndex) {
            return;
        }

        if (this._lastDropdownAnchorIndex !== undefined) {
            (this._anchorElements[this._lastDropdownAnchorIndex] as HTMLElement).classList.remove('active');
        }

        (this._anchorElements[activeDropdownAnchorIndex] as HTMLElement).classList.add('active');
        this._lastDropdownAnchorIndex = activeDropdownAnchorIndex;
    }

    private updateActiveSectionAnchor = (newIndex: number): void => {
        let activeAnchorIndex = newIndex === 0 ? 0 : newIndex - 1; // anchor elements does not include level 1 anchor
        let activeAnchorElement = this._anchorElements[activeAnchorIndex] as HTMLElement;
        let anchorBoundingRect = activeAnchorElement.getBoundingClientRect();

        let translateY = anchorBoundingRect.top - this._outlineScrollableElement.getBoundingClientRect().top + this._outlineScrollableElement.scrollTop;

        this._knobElement.style.transform = `translateY(${translateY}px) scaleY(${anchorBoundingRect.height})`;
    }

    public getAnchorElements(): NodeList {
        return this._anchorElements;
    }
}