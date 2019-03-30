import { named, injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';
import ResizeObserver from 'resize-observer-polyfill';
import { MenuMode } from '../shared/menuMode';
import ThrottleService from '../shared/throttleService';
import OutlineFactory from '../shared/outlineFactory';
import Outline from '../shared/outline';
import ArticleGlobalService from '../shared/articleGlobalService';

interface TextData {
    part1: string;
    part2: string;
}

@injectable()
export default class ArticleMenuComponent extends RootComponent {
    private static readonly VERTICAL_GAP: number = 23;

    private _articleMenuElement: HTMLElement;
    private _outlineLevel1ULElement: HTMLUListElement;
    private _pageFooterElement: HTMLElement;
    private _headerText1Element: HTMLElement;
    private _headerText2Element: HTMLElement;

    private _headerTextData: TextData[] = [];
    private _outline: Outline;
    private _dropdown: Dropdown;
    private _bodyResizeObserver: ResizeObserver;
    private _menuMode: MenuMode;
    private _updateOutlineHeightThrottled: () => void;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') private _mediaGlobalService: MediaGlobalService,
        @inject('GlobalService') @named('ArticleGlobalService') private _articleGlobalService: ArticleGlobalService,
        private _throttleService: ThrottleService,
        private _dropdownFactory: DropdownFactory,
        private _outlineFactory: OutlineFactory) {
        super();
    }

    public enabled(): boolean {
        if (this._articleMenuElement === undefined) {
            this._articleMenuElement = document.querySelector('.article-menu');
        }

        return this._articleMenuElement ? true : false;
    }

    public setupImmediate() {
        this._headerText1Element = this._articleMenuElement.querySelector('.article-menu__header-text-1');
        this._headerText2Element = this._articleMenuElement.querySelector('.article-menu__header-text-2');
        this._outlineLevel1ULElement = this._articleMenuElement.querySelector('.article-menu__outline ul');
        this._pageFooterElement = document.querySelector('.page-footer');

        this._updateOutlineHeightThrottled = this._throttleService.createThrottledFunction(this.updateOutlineHeight);

        this._bodyResizeObserver = new ResizeObserver(this._updateOutlineHeightThrottled);
        this.setupText();
    }

    public setupOnDomContentLoaded(): void {
        // Dropdown
        this._dropdown = this._dropdownFactory.build(this._articleMenuElement, () => this._outline.updateKnob(this._articleGlobalService.getActiveSectionIndex()));

        // Outline
        this._outline = this._outlineFactory.build(this._articleMenuElement.querySelector('.article-menu__outline'), () => this._dropdown.collapse());
    }

    public setupOnLoad(): void {
        this._mediaGlobalService.addChangedToListener(this.onChangedToDropdownListener, MediaWidth.narrow);
        this._mediaGlobalService.addChangedFromListener(this.onChangedToSideMenuListener, MediaWidth.narrow);
    }

    private onChangedToDropdownListener = (init: boolean): void => {
        this._menuMode = MenuMode.dropdown;

        this._outline.enableAnchorClickListener();
        this._articleGlobalService.addActiveSectionChangedListener(this.updateHeaderText, true);

        if (!init) {
            this._bodyResizeObserver.unobserve(document.body);
            window.removeEventListener('resize', this._updateOutlineHeightThrottled);
            window.removeEventListener('scroll', this.updateOutlineHeight);
            this._articleGlobalService.removeActiveSectionChangedListener(this.outlineSetActiveAnchorWrapper);

            if (this._outlineLevel1ULElement) {
                this._outlineLevel1ULElement.style.maxHeight = '';
            }
        }
    }

    private onChangedToSideMenuListener = (init: boolean): void => {
        this._menuMode = MenuMode.sideMenu;

        this._dropdown.reset();

        window.addEventListener('resize', this._updateOutlineHeightThrottled);
        window.addEventListener('scroll', this.updateOutlineHeight);
        //Makes initial call to updateToc (initial call is defined in the spec) - https://github.com/WICG/ResizeObserver/issues/8, unfortunately, call is delayed
        this._bodyResizeObserver.observe(document.body);

        this._updateOutlineHeightThrottled();

        this._articleGlobalService.addActiveSectionChangedListener(this.outlineSetActiveAnchorWrapper, true);

        if (!init) {
            this._outline.disableAnchorClickListener();
            this._articleGlobalService.removeActiveSectionChangedListener(this.updateHeaderText);
        }
    }

    private outlineSetActiveAnchorWrapper = (newIndex: number): void => {
        this._outline.updateKnob(newIndex);
    }

    private updateOutlineHeight = (): void => {
        if (!this._outlineLevel1ULElement || this._menuMode !== MenuMode.sideMenu) { // Necessary because bodyResizeObserver fires after unobserve
            return;
        }

        let level1ULElementTop = this._outlineLevel1ULElement.getBoundingClientRect().top;
        let footerTop = this._pageFooterElement.getBoundingClientRect().top;

        let level1ULElementHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
            - ArticleMenuComponent.VERTICAL_GAP
            - level1ULElementTop;

        this._outlineLevel1ULElement.style.maxHeight = `${level1ULElementHeight}px`;
    }

    private updateHeaderText = (newIndex: number): void => {
        let textData: TextData = this._headerTextData[newIndex];

        this._headerText1Element.innerText = textData.part1;

        if (textData.part2) {
            this._headerText2Element.innerText = textData.part2;
            this._headerText2Element.parentElement.classList.remove('bar-separated-list__item--hidden');
        } else {
            this._headerText2Element.parentElement.classList.add('bar-separated-list__item--hidden');
        }
    }

    private setupText(): void {
        let currentPart1: string;
        let sectionElements: HTMLElement[] = this._articleGlobalService.getSectionElements();

        for (let i = 0; i < sectionElements.length; i++) {
            let sectionElement = sectionElements[i];

            if (sectionElement.classList.contains('main-article')) {
                this._headerTextData.push({ part1: 'Contents', part2: null });
            }
            else if (sectionElement.classList.contains('flexi-section-block-2')) {
                currentPart1 = sectionElement.firstElementChild.firstElementChild.textContent;
                this._headerTextData.push({ part1: currentPart1, part2: null });
            } else {
                // level 3
                this._headerTextData.push({ part1: currentPart1, part2: sectionElement.firstElementChild.firstElementChild.textContent });
            }
        }
    }
}