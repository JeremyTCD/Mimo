import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaService from '../shared/mediaService';
import OverlayService from '../shared/overlayService';
import { MediaWidth } from '../shared/mediaWidth';
import SectionPagesComponent from './sectionPagesComponent';
import SectionMenuHeaderComponent from './sectionMenuHeaderComponent';
import SectionPagesFilterComponent from './sectionPagesFilterComponent';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';
import ResizeObserver from 'resize-observer-polyfill';
import DebounceService from '../shared/debounceService';

@injectable()
export default class SectionMenuComponent extends RootComponent {
    private _sectionMenuElement: HTMLElement;
    private _headerButtonElement: HTMLElement;
    private _pagesOuterWrapperElement: HTMLElement;
    private _pagesInnerWrapperElement: HTMLElement;
    private _footerElement: HTMLElement;
    private _sectionPagesElement: HTMLElement;

    private _sectionPagesComponent: SectionPagesComponent;
    private _sectionMenuHeaderComponent: SectionMenuHeaderComponent;
    private _sectionPagesFilterComponent: SectionPagesFilterComponent;

    private _mediaService: MediaService;
    private _overlayService: OverlayService;
    private _debounceService: DebounceService;
    private _dropdownFactory: DropdownFactory;

    public static readonly VERTICAL_GAP: number = 23;
    private static readonly HEADER_HEIGHT: number = 37;
    private static readonly DEBOUNCE_TIME: number = 150;
    private static readonly SCROLL_OPTIONS = { speed: 400 };
    private _inCore2: boolean;
    private _dropdown: Dropdown;
    private _bodyResizeObserver: ResizeObserver;

    public constructor(
        debounceService: DebounceService,
        sectionPagesComponent: SectionPagesComponent,
        sectionMenuHeaderComponent: SectionMenuHeaderComponent,
        sectionPagesFilterComponent: SectionPagesFilterComponent,
        overlayService: OverlayService,
        dropdownFactory: DropdownFactory,
        mediaService: MediaService) {
        super();

        this._sectionMenuHeaderComponent = sectionMenuHeaderComponent;
        this._sectionPagesFilterComponent = sectionPagesFilterComponent;
        this._sectionPagesComponent = sectionPagesComponent;
        this._overlayService = overlayService;
        this._mediaService = mediaService;
        this._debounceService = debounceService;
        this._dropdownFactory = dropdownFactory;

        this.addChildComponents(sectionMenuHeaderComponent, sectionPagesFilterComponent, sectionPagesComponent);
    }

    public enabled(): boolean {
        return this._sectionMenuElement ? true : false;
    }

    public setupImmediate(): void {
        this._sectionMenuElement = document.getElementById('section-menu');

        if (this.enabled()) {
            this.childComponentsSetupImmediate();
            this._bodyResizeObserver = new ResizeObserver(this._debounceService.createTimeoutDebounceFunction(this.updatePages, SectionMenuComponent.DEBOUNCE_TIME));
        }
    }

    public setupOnDomContentLoaded(): void {
        this.childComponentsSetupOnDomContentLoaded();

        let wrapperElement = document.getElementById('section-menu-wrapper');
        this._pagesInnerWrapperElement = document.getElementById('section-pages-inner-wrapper');
        this._sectionPagesElement = document.getElementById('section-pages');
        this._footerElement = document.querySelector('body > footer');
        this._headerButtonElement = document.getElementById('section-menu-header-button');
        this._pagesOuterWrapperElement = document.getElementById('section-pages-outer-wrapper');
        this._inCore2 = this._sectionMenuElement.parentElement.getAttribute('id') === 'core-2';

        this._dropdown = this._dropdownFactory.build(this._pagesOuterWrapperElement, this._pagesInnerWrapperElement, this._headerButtonElement, wrapperElement);
    }

    public setupOnLoad(): void {
        this.childComponentsSetupOnLoad();

        // Makes initial updatePages call
        this._bodyResizeObserver.observe(document.body);
        this.updateDropdown()
    }

    public registerListeners(): void {
        this.childComponentsRegisterListeners();

        window.addEventListener('scroll', this.windowScrollListener);
        window.addEventListener('resize', this.windowResizeListener);

        this._headerButtonElement.addEventListener('click', this.buttonClickListener);
    }

    private buttonClickListener = (): void => {
        if (this._dropdown.isExpanded()) {
            this._overlayService.deactivateOverlay();
        } else {
            this._overlayService.activateOverlay(this._sectionMenuElement);
        }

        this._dropdown.toggleWithAnimation();
    }

    private windowScrollListener = (): void => {
        this.updatePages();
    }

    private windowResizeListener = (): void => {
        this.updatePages();
        this.updateDropdown()
    }

    private updatePages = (): void => {
        let pagesFixed = this._pagesOuterWrapperElement.classList.contains('fixed');
        let top: number;

        if (this._mediaService.mediaWidthWide() || !this._inCore2 && this._mediaService.mediaWidthMedium()) {
            let top = this._sectionMenuElement.getBoundingClientRect().top;
            let fix = top < SectionMenuComponent.VERTICAL_GAP;

            // To avoid an unecessary layout, set pages height here
            this.updatePagesHeight(fix, top);

            if (fix && !pagesFixed) {
                this._pagesOuterWrapperElement.classList.add('fixed');
            } else if (!fix && pagesFixed) {
                this._pagesOuterWrapperElement.classList.remove('fixed');
            }
        } else {
            if (pagesFixed) {
                this._pagesOuterWrapperElement.classList.remove('fixed');
            }
            this._sectionPagesElement.style.height = '';
        }
    }

    // | MediaWidth | inCore2 | collapsed |
    // | narrow     | y/n     | y         |
    // | medium     | y       | y         |
    // | medium     | n       | n         |
    // | wide       | y/n     | n         |
    private updateDropdown(): void {
        let previousMediaWidth: MediaWidth = this._mediaService.getPreviousMediaWidth();

        if (this._mediaService.mediaWidthNarrow() || this._inCore2 && this._mediaService.mediaWidthMedium()) {
            // Update wrapper maxheight so it is scrollable as a dropdown menu
            this._pagesInnerWrapperElement.style.maxHeight = `${window.innerHeight - SectionMenuComponent.HEADER_HEIGHT}px`;

            if (previousMediaWidth === MediaWidth.wide ||
                !this._inCore2 && previousMediaWidth === MediaWidth.medium) {
                // Going from being beside main to being collapsed
                this._dropdown.collapseWithoutAnimation();
            }
        } else if (previousMediaWidth === MediaWidth.narrow || this._inCore2 && previousMediaWidth == MediaWidth.medium) {
            this._pagesInnerWrapperElement.style.maxHeight = '';

            if (this._dropdown.isExpanded()) {
                this._overlayService.deactivateOverlay(false);
            }

            // Going from collapsed to being beside main
            this._dropdown.reset();
        }
    }

    // This function cannot be part of pages component because pages filter and section menu element state is required
    private updatePagesHeight(fixed: boolean, sectionMenuElementTop: number): void {
        let footerTop = this._footerElement.getBoundingClientRect().top;

        let pagesHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
            - SectionMenuComponent.VERTICAL_GAP
            - (fixed ? this._sectionPagesFilterComponent.getFixedBottom() :
                sectionMenuElementTop + this._sectionPagesFilterComponent.getHeight());

        // Tried setting bottom, max-height, both don't work on edge - scroll bar doesn't go away even when height is greater than 
        // menu height. This works.
        this._sectionPagesElement.style.height = `${pagesHeight}px`;
    }
}
