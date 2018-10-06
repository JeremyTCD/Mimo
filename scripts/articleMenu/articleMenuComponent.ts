import { named, injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaGlobalService from '../shared/mediaGlobalService';
import OverlayService from '../shared/overlayService';
import { MediaWidth } from '../shared/mediaWidth';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';
import ResizeObserver from 'resize-observer-polyfill';
import DebounceService from '../shared/debounceService';
import OutlineComponent from './outlineComponent';
import ArticleLinksComponent from './articleLinksComponent';
import ArticleMenuHeaderComponent from './articleMenuHeaderComponent';
import { MenuMode } from '../shared/menuMode';

@injectable()
export default class ArticleMenuComponent extends RootComponent {
    private _articleMenuElement: HTMLElement;
    private _linksAndTocOuterWrapperElement: HTMLElement;
    private _linksAndTocInnerWrapperElement: HTMLElement;
    private _headerButtonElement: HTMLElement;
    private _footerElement: HTMLElement;
    private _outlineScrollable: HTMLElement;

    private _outlineComponent: OutlineComponent;

    private _mediaGlobalService: MediaGlobalService;
    private _overlayService: OverlayService;
    private _debounceService: DebounceService;
    private _dropdownFactory: DropdownFactory;

    private static readonly VERTICAL_GAP: number = 23;
    private static readonly HEADER_HEIGHT: number = 37;
    private static readonly DEBOUNCE_TIME: number = 150;
    private _dropdown: Dropdown;
    private _bodyResizeObserver: ResizeObserver;
    private _linksAndOutlineLevel1Height: number;
    private _updateSideMenuQueued: boolean;
    private _menuMode: MenuMode;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService,
        outlineComponent: OutlineComponent,
        articleLinksComponent: ArticleLinksComponent,
        articleMenuHeaderComponent: ArticleMenuHeaderComponent,
        debounceService: DebounceService,
        overlayService: OverlayService,
        dropdownFactory: DropdownFactory) {
        super();

        this._overlayService = overlayService;
        this._mediaGlobalService = mediaGlobalService;
        this._debounceService = debounceService;
        this._dropdownFactory = dropdownFactory;
        this._outlineComponent = outlineComponent;

        this.addChildComponents(outlineComponent, articleLinksComponent, articleMenuHeaderComponent);
    }

    public setupImmediate() {
        this._articleMenuElement = document.getElementById('article-menu');

        if (this.enabled()) {
            this.childComponentsSetupImmediate();
            this._bodyResizeObserver = new ResizeObserver(this._debounceService.createTimeoutDebounceFunction(this.updateSideMenu, ArticleMenuComponent.DEBOUNCE_TIME));
        }
    }

    public enabled(): boolean {
        return this._articleMenuElement ? true : false;
    }

    public setupOnDomContentLoaded(): void {
        this.childComponentsSetupOnDomContentLoaded();

        this._linksAndTocOuterWrapperElement = document.getElementById('article-links-and-outline-outer-wrapper');
        this._linksAndTocInnerWrapperElement = document.getElementById('article-links-and-outline-inner-wrapper');
        this._footerElement = document.getElementById('page-footer');
        this._outlineScrollable = document.getElementById('outline-scrollable');
        this._headerButtonElement = document.getElementById('article-menu-header-button');

        this._dropdown = this._dropdownFactory.build(this._linksAndTocOuterWrapperElement, this._linksAndTocInnerWrapperElement, this._headerButtonElement, this._articleMenuElement);
    }

    public setupOnLoad(): void {
        let outlineTitleElement = document.querySelector('#outline > .level-1');
        let outlineTitleComputedStyle = getComputedStyle(outlineTitleElement);
        let articleLinksElement = document.getElementById('article-links');
        let articleLinksComputedStyle = getComputedStyle(articleLinksElement);
        let outlineComputedStyle = getComputedStyle(this._outlineScrollable);

        this._linksAndOutlineLevel1Height = parseFloat(articleLinksComputedStyle.marginBottom) +
            parseFloat(articleLinksComputedStyle.height) +
            parseFloat(outlineTitleComputedStyle.height) +
            parseFloat(outlineComputedStyle.marginTop) +
            ArticleLinksComponent.TOP_NEGATIVE_MARGIN;

        this._headerButtonElement.addEventListener('click', this.buttonClickListener);

        let outlineAnchorElements = this._outlineComponent.getAnchorElements();
        if (outlineAnchorElements) {
            for (let i = 0; i < outlineAnchorElements.length; i++) {
                outlineAnchorElements[i].addEventListener('click', this.outlineAnchorClickListener);
            }
            outlineTitleElement.addEventListener('click', this.outlineAnchorClickListener);
        }

        this._mediaGlobalService.addChangedToListener(this.onChangedToDropdownListener, MediaWidth.narrow);
        this._mediaGlobalService.addChangedFromListener(this.onChangedToSideMenuListener, MediaWidth.narrow);

        // outlineComponent's update knob methods must run after updateToc (incase updating outline height causes wrapping, in turn causing anchor bounding rects to change)
        this.childComponentsSetupOnLoad();
    }

    private buttonClickListener = (): void => {
        this._dropdown.toggleWithAnimation();

        if (this._dropdown.isExpanded()) {
            this._overlayService.activateOverlay(this._articleMenuElement);
            this.updateDropdown();
            this._outlineComponent.updateDropdownKnob();
        } else {
            this._overlayService.deactivateOverlay();
        }
    }

    private outlineAnchorClickListener = (): void => {
        if (this._mediaGlobalService.mediaWidthIs(MediaWidth.narrow)) {
            this._overlayService.deactivateOverlay();
            this._dropdown.collapseWithAnimation();
        }
    }

    private onChangedToDropdownListener = (init: boolean): void => {
        this._menuMode = MenuMode.dropdown;

        if (!init) {
            this._bodyResizeObserver.unobserve(document.body);
            window.removeEventListener('resize', this.updateSideMenu);
            window.removeEventListener('scroll', this.updateSideMenu);

            this.resetSideMenu();
        }

        this._dropdown.collapseWithoutAnimation();

        window.addEventListener('resize', this.updateDropdown);
    }

    private onChangedToSideMenuListener = (init: boolean): void => {
        this._menuMode = MenuMode.sideMenu;

        if (!init) {
            window.removeEventListener('resize', this.updateDropdown);
        }

        this.resetDropdown();

        window.addEventListener('resize', this.updateSideMenu);
        window.addEventListener('scroll', this.updateSideMenuDeferred);
        //Makes initial call to updateToc (initial call is defined in the spec) - https://github.com/WICG/ResizeObserver/issues/8, unfortunately, call is delayed
        this._bodyResizeObserver.observe(document.body);

        this.updateSideMenu();
    }

    private updateDropdown = (): void => {
        if (this._menuMode === MenuMode.dropdown && this._dropdown.isExpanded()) { // Edge fires resize listeners even after they have been removed
            // TODO figure out some way to do this using css - hard to use calc since 100vh is fixed on many mobile browsers > https://developers.google.com/web/updates/2016/12/url-bar-resizing
            this._linksAndTocInnerWrapperElement.style.maxHeight = `${window.innerHeight - ArticleMenuComponent.HEADER_HEIGHT}px`;
        }
    }

    private resetDropdown = (): void => {
        this._linksAndTocInnerWrapperElement.style.maxHeight = '';

        if (this._dropdown.isExpanded()) {
            this._overlayService.deactivateOverlay(false);
        }

        this._dropdown.reset();
    }

    private updateSideMenu = (): void => {
        if (this._menuMode === MenuMode.sideMenu) { // Necessary because bodyResizeObserver fires after unobserve
            let articleMenuTop = this._articleMenuElement.getBoundingClientRect().top;
            let footerTop = this._footerElement.getBoundingClientRect().top;

            let outlineHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
                - ArticleMenuComponent.VERTICAL_GAP
                - this._linksAndOutlineLevel1Height
                - Math.max(ArticleMenuComponent.VERTICAL_GAP, articleMenuTop);

            // Tried setting bottom, max-height, both don't work on edge - scroll bar doesn't go away even when height is greater than 
            // menu height. This works.
            this._outlineScrollable.style.height = `${outlineHeight}px`;
        }

        this._updateSideMenuQueued = false;
    }

    private resetSideMenu = (): void => {
        this._outlineScrollable.style.height = '';
    }

    // Fixes smooth-scroll/chrome issue. Scroll event fires before raf callbacks are called, since smooth-scroll uses raf to scroll, footer top is not accurate until after smooth-scroll's raf callback
    // fires
    private updateSideMenuDeferred = (): void => {
        if (!this._updateSideMenuQueued) {
            requestAnimationFrame(this.updateSideMenu);
            this._updateSideMenuQueued = true;
        }
    }
}