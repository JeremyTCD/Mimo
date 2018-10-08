import { injectable, inject, named } from 'inversify';
import Component from '../shared/component';
import '../shared/treeNode';
import ArticleGlobalService from '../shared/articleGlobalService';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';

@injectable()
export default class OutlineComponent implements Component {
    private _outlineElement: HTMLElement;
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
        this._outlineElement = document.getElementById('outline');
        this._knobElement = document.getElementById('outline-scrollable-knob');
        this._rootUnorderedListElement = this._outlineElement.querySelector('ul');
        this._anchorElements = this._rootUnorderedListElement.querySelectorAll('a');
    }

    public setupOnLoad(): void {
        this._mediaGlobalService.addChangedToListener(this.onChangedToNarrowListener, MediaWidth.narrow);
        this._mediaGlobalService.addChangedFromListener(this.onChangedFromNarrowListener, MediaWidth.narrow);
    }

    private onChangedToNarrowListener = (init: boolean): void => {
        if (!init) {
            this._articleGlobalService.removeIndexChangedListener(this.updateSideMenuKnob);
        }
    }

    private onChangedFromNarrowListener = (): void => {
        this._articleGlobalService.addIndexChangedListener(this.updateSideMenuKnob, true);
    }

    public updateDropdownKnob = (): void => {
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

    private updateSideMenuKnob = (newIndex: number): void => {
        let activeAnchorIndex = newIndex === -1 ? 0 : newIndex;
        let activeAnchorElement = this._anchorElements[activeAnchorIndex] as HTMLElement;
        let anchorBoundingRect = activeAnchorElement.getBoundingClientRect();
        let translateY = anchorBoundingRect.top - this._outlineElement.getBoundingClientRect().top + this._outlineElement.scrollTop;

        this._knobElement.style.transform = `translateY(${translateY}px) scaleY(${anchorBoundingRect.height})`;
    }

    public getAnchorElements(): NodeList {
        return this._anchorElements;
    }
}