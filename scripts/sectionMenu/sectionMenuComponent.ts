import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaService from '../shared/mediaService';
import TransitionService from '../shared/transitionService';
import OverlayService from '../shared/overlayService';
import { MediaWidth } from '../shared/mediaWidth';
import * as SmoothScroll from 'smooth-scroll';
import SectionPagesComponent from './sectionPagesComponent';
import SectionMenuHeaderComponent from './sectionMenuHeaderComponent';
import SectionPagesFilterComponent from './sectionPagesFilterComponent';

@injectable()
export default class SectionMenuComponent extends RootComponent {
    private _sectionMenuElement: HTMLElement;
    private _headerButtonElement: HTMLElement;
    private _headerElement: HTMLElement;
    private _pagesWrapperElement: HTMLElement;
    private _footerElement: HTMLElement;
    private _sectionPagesElement: HTMLElement;

    private _sectionPagesComponent: SectionPagesComponent;
    private _sectionMenuHeaderComponent: SectionMenuHeaderComponent;
    private _sectionPagesFilterComponent: SectionPagesFilterComponent;

    private _mediaService: MediaService;
    private _transitionService: TransitionService;
    private _overlayService: OverlayService;

    public static readonly VERTICAL_GAP: number = 23;
    private static readonly HEADER_HEIGHT: number = 37;
    private static readonly SCROLL_OPTIONS = { speed: 400 };
    private _inCore2: boolean;
    private _smoothScroll: SmoothScroll;
    private _lastScrollY: number;
    private _enabledAttempted: boolean;

    public constructor(
        sectionPagesComponent: SectionPagesComponent,
        sectionMenuHeaderComponent: SectionMenuHeaderComponent,
        sectionPagesFilterComponent: SectionPagesFilterComponent,
        transitionService: TransitionService,
        overlayService: OverlayService,
        mediaService: MediaService) {
        super();

        this._sectionMenuHeaderComponent = sectionMenuHeaderComponent;
        this._sectionPagesFilterComponent = sectionPagesFilterComponent;
        this._sectionPagesComponent = sectionPagesComponent;
        this._transitionService = transitionService;
        this._overlayService = overlayService;
        this._mediaService = mediaService;

        this.addChildComponents(sectionMenuHeaderComponent, sectionPagesFilterComponent, sectionPagesComponent);
    }

    public enabled(): boolean {
        if (!this._enabledAttempted) {
            this._sectionMenuElement = document.getElementById('section-menu');
        }

        return this._sectionMenuElement ? true : false;
    }

    public setupImmediate(): void {
        this.childComponentsSetupImmediate();
        this._smoothScroll = new SmoothScroll();
    }

    public setupOnDomContentLoaded(): void {
        this.childComponentsSetupOnDomContentLoaded();

        this._sectionPagesElement = document.getElementById('section-pages');
        this._footerElement = document.querySelector('body > footer');
        this._headerElement = document.getElementById('section-menu-header');
        this._headerButtonElement = document.getElementById('section-menu-header-button');
        this._pagesWrapperElement = document.getElementById('section-pages-wrapper');
        this._inCore2 = this._sectionMenuElement.parentElement.getAttribute('id') === 'core-2';
    }

    public setupOnLoad(): void {
        this.childComponentsSetupOnLoad();

        this.updateFixed();
        this.updatedDropdown()
    }

    public registerListeners(): void {
        this.childComponentsRegisterListeners();

        window.addEventListener('scroll', this.windowScrollListener);
        window.addEventListener('resize', this.windowResizeListener);

        this._headerButtonElement.addEventListener('click', this.buttonClickListener);
    }

    private buttonClickListener = (): void => {
        if (this._headerButtonElement.classList.contains('expanded')) {
            this._overlayService.deactivateOverlay(this._sectionMenuElement);
            this._smoothScroll.animateScroll(this._lastScrollY, null, SectionMenuComponent.SCROLL_OPTIONS);
        } else {
            this._overlayService.activateOverlay(this._sectionMenuElement, false);
            this._lastScrollY = window.scrollY;
            this._smoothScroll.animateScroll(this._headerElement, null, SectionMenuComponent.SCROLL_OPTIONS);
        }

        this._transitionService.toggleHeightWithTransition(this._pagesWrapperElement, this._headerButtonElement);
    }

    private windowScrollListener = (): void => {
        this.updateFixed();
    }

    private windowResizeListener = (): void => {
        this.updateFixed();
        this.updatedDropdown()
    }

    private updateFixed(): void {
        let pagesFixed = this._pagesWrapperElement.classList.contains('fixed');
        let top: number;

        if (this._mediaService.mediaWidthWide() || !this._inCore2 && this._mediaService.mediaWidthMedium()) {
            let top = this._sectionMenuElement.getBoundingClientRect().top;
            let fix = top < SectionMenuComponent.VERTICAL_GAP;

            // To avoid an unecessary layout, set pages height here
            this.updatePagesHeight(fix, top);

            if (fix && !pagesFixed) {
                // If a page's article's height is less than its section menu's height, when pages' position is set to fixed, footer shifts up.
                // This causes the page to shrink vertically: assuming that a user is scolled all the way down (such that the footer is in the viewport),
                // this in turn means that element's top values increase. When section menu moves down (and its top value increases), this function
                // triggers again pages' position is set to initial. This makes it becomes impossible to scroll past the point where pages becomes fixed. 
                // This simple fix prevents that by preventing footer from shifting up.
                // Note: clientHeight is rounded to an integer, but I can't find any evidence that it gets rounded up on all browsers, so add 1.
                this._sectionMenuElement.style.minHeight = `${this._sectionMenuElement.clientHeight + 1}px`;

                this._pagesWrapperElement.classList.add('fixed');
            } else if (!fix && pagesFixed) {
                this.unfixPages();
            }


        } else if (pagesFixed) {
            this.unfixPages();
        }
    }

    // | MediaWidth | inCore2 | collapsed |
    // | narrow     | y/n     | y         |
    // | medium     | y       | y         |
    // | medium     | n       | n         |
    // | wide       | y/n     | n         |
    private updatedDropdown(): void {
        let previousMediaWidth: MediaWidth = this._mediaService.getPreviousMediaWidth();

        if (this._mediaService.mediaWidthNarrow() || this._inCore2 && this._mediaService.mediaWidthMedium()) {
            // Update wrapper maxheight so it is scrollable as a dropdown menu
            this._pagesWrapperElement.style.maxHeight = `${window.innerHeight - SectionMenuComponent.HEADER_HEIGHT}px`;

            if (previousMediaWidth === MediaWidth.wide ||
                !this._inCore2 && previousMediaWidth === MediaWidth.medium) {
                // Going from being beside main to being collapsed
                this._transitionService.contractHeightWithoutTransition(this._pagesWrapperElement, this._headerButtonElement);
            }
        } else if (previousMediaWidth === MediaWidth.narrow ||
            this._inCore2 && previousMediaWidth == MediaWidth.medium) {

            // Going from collapsed to being beside main
            this._transitionService.reset(this._pagesWrapperElement, this._headerButtonElement);
            this._overlayService.deactivateOverlay(this._sectionMenuElement, false);
        }
    }

    private updatePagesHeight (fixed: boolean, sectionMenuElementTop: number): void {
        let footerTop = this._footerElement.getBoundingClientRect().top;

        let pagesHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
            - SectionMenuComponent.VERTICAL_GAP
            - (fixed ? this._sectionPagesFilterComponent.getFixedBottom() : 
            sectionMenuElementTop + this._sectionPagesFilterComponent.getHeight());

        // Tried setting bottom, max-height, both don't work on edge - scroll bar doesn't go away even when height is greater than 
        // menu height. This works.
        this._sectionPagesElement.style.height = `${pagesHeight}px`;
    }

    private unfixPages() {
        this._pagesWrapperElement.classList.remove('fixed');
        this._sectionMenuElement.style.minHeight = 'initial';
    }
}
