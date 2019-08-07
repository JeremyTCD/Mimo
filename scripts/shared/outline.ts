import ArticleGlobalService from '../shared/articleGlobalService';

export default class Outline {
    private _anchorElements: HTMLElement[];
    private _secondAnchorElement: HTMLElement; // Knob is the before pseudo element of the second anchor so that it can be adjacent to the second anchor initially
    private _knobCurrentAdjacentAnchorIndex: number;

    public constructor(private _articleGlobalService: ArticleGlobalService,
        private _anchorOnClick: {(): void},
        rootElement: HTMLUListElement) {
        this._anchorElements = Array.from(rootElement.querySelectorAll('a'));
        this._secondAnchorElement = (this._anchorElements.length > 1 ? this._anchorElements[1] : null) as HTMLElement;
        this._knobCurrentAdjacentAnchorIndex = 1;

        window.addEventListener('resize', () => this.updateKnob(this._articleGlobalService.getActiveSectionIndex(), true)); // When page resizes, heights and tops of anchors in outline may change
    }

    public updateKnob = (activeAnchorIndex: number, force: boolean = false): void => {
        if (!this._secondAnchorElement) {
            return; // No anchors other than first anchor
        }

        let knobAdjacentAnchorIndex = activeAnchorIndex === 0 ? 1 : activeAnchorIndex; // Knob is never adjacent to first anchor

        if (!force && this._knobCurrentAdjacentAnchorIndex === knobAdjacentAnchorIndex) { // We might need to force update if outline item heights change
            return;
        }

        // Update current index
        this._knobCurrentAdjacentAnchorIndex = knobAdjacentAnchorIndex;

        // Update knob
        if (knobAdjacentAnchorIndex == 1) {
            this._secondAnchorElement.setAttribute('style', '');
            return;
        }

        let knobAdjacentAnchorElement = this._anchorElements[knobAdjacentAnchorIndex] as HTMLElement;
        let secondAnchorElementBoundingClientRect = this._secondAnchorElement.getBoundingClientRect();
        let secondAnchorElementHeight = secondAnchorElementBoundingClientRect.height;
        let secondAnchorElementCenter = secondAnchorElementBoundingClientRect.top + secondAnchorElementHeight / 2;
        let knobAdjacentBoundingClientRect = knobAdjacentAnchorElement.getBoundingClientRect();
        let knobAdjacentAnchorHeight = knobAdjacentBoundingClientRect.height;
        let knobAdjacentAnchorCenter = knobAdjacentBoundingClientRect.top + knobAdjacentAnchorHeight / 2;

        let translateY = knobAdjacentAnchorCenter - secondAnchorElementCenter;
        let scaleY = knobAdjacentAnchorHeight / secondAnchorElementHeight;

        this._secondAnchorElement.setAttribute('style', `--scaleY: ${scaleY}; --translateY: ${translateY}px;`);
    }

    public enableAnchorClickListener(): void {
        for (let i = 0; i < this._anchorElements.length; i++) {
            (this._anchorElements[i] as HTMLElement).addEventListener('click', this.anchorOnClick);
        }
    }

    public disableAnchorClickListener(): void {
        for (let i = 0; i < this._anchorElements.length; i++) {
            (this._anchorElements[i] as HTMLElement).removeEventListener('click', this.anchorOnClick);
        }
    }

    private anchorOnClick = (event: Event): void => {
        if (this._anchorOnClick) {
            this._anchorOnClick();
        }

        let index = this._anchorElements.indexOf(event.currentTarget as HTMLElement); // Note that this._articleGlobalService doesn't update activeSectionIndex till scroll begins

        if (index === -1) {
            return;
        }

        this.updateKnob(index);
    }
}