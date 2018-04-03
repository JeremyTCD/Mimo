import { named, injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaGlobalService from '../shared/mediaGlobalService';
import OverlayService from '../shared/overlayService';
import { MediaWidth } from '../shared/mediaWidth';
import SectionPagesComponent from './sectionPagesComponent';
import SectionMenuHeaderComponent from './sectionMenuHeaderComponent';
import SectionPagesFilterComponent from './sectionPagesFilterComponent';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';
import ResizeObserver from 'resize-observer-polyfill';
import DebounceService from '../shared/debounceService';
import { MenuMode } from '../shared/menuMode';

@injectable()
export default class SectionMenuComponent extends RootComponent {
    private _sectionMenuElement: HTMLElement;
    private _headerButtonElement: HTMLElement;
    private _pagesOuterWrapperElement: HTMLElement;
    private _pagesInnerWrapperElement: HTMLElement;
    private _footerElement: HTMLElement;
    private _sectionPagesElement: HTMLElement;

    private _mediaGlobalService: MediaGlobalService;
    private _overlayService: OverlayService;
    private _debounceService: DebounceService;
    private _dropdownFactory: DropdownFactory;

    public static readonly VERTICAL_GAP: number = 23;
    private static readonly HEADER_HEIGHT: number = 37;
    private static readonly DEBOUNCE_TIME: number = 150;
    private _dropdown: Dropdown;
    private _bodyResizeObserver: ResizeObserver;
    private _updateSideMenuQueued: boolean;
    private _filterHeight: number;
    private _menuMode: MenuMode

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService,
        debounceService: DebounceService,
        sectionPagesComponent: SectionPagesComponent,
        sectionMenuHeaderComponent: SectionMenuHeaderComponent,
        sectionPagesFilterComponent: SectionPagesFilterComponent,
        overlayService: OverlayService,
        dropdownFactory: DropdownFactory) {
        super();

        this._overlayService = overlayService;
        this._mediaGlobalService = mediaGlobalService;
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
            this._bodyResizeObserver = new ResizeObserver(this._debounceService.createTimeoutDebounceFunction(this.updateSideMenu, SectionMenuComponent.DEBOUNCE_TIME));
        }
    }

    public setupOnDomContentLoaded(): void {
        this.childComponentsSetupOnDomContentLoaded();

        this._pagesInnerWrapperElement = document.getElementById('section-pages-inner-wrapper');
        this._sectionPagesElement = document.getElementById('section-pages');
        this._footerElement = document.getElementById('page-footer');
        this._headerButtonElement = document.getElementById('section-menu-header-button');
        this._pagesOuterWrapperElement = document.getElementById('section-pages-outer-wrapper');

        this._dropdown = this._dropdownFactory.build(this._pagesOuterWrapperElement, this._pagesInnerWrapperElement, this._headerButtonElement, this._sectionMenuElement);
    }

    public setupOnLoad(): void {
        let filterElement = document.getElementById('section-pages-filter');
        let filterComputedStyle = getComputedStyle(filterElement);
        // Does not change
        this._filterHeight = parseFloat(filterComputedStyle.marginBottom) + parseFloat(filterComputedStyle.height);

        this.childComponentsSetupOnLoad();

        this._headerButtonElement.addEventListener('click', this.buttonClickListener);

        let inCoreOuter = this._sectionMenuElement.parentElement.getAttribute('id') === 'core-outer';

        if (inCoreOuter) {
            this._mediaGlobalService.addChangedFromListener(this.onChangedToDropdownListener, MediaWidth.wide);
            this._mediaGlobalService.addChangedToListener(this.onChangedToSideMenuListener, MediaWidth.wide);
        } else {
            this._mediaGlobalService.addChangedFromListener(this.onChangedToSideMenuListener, MediaWidth.narrow);
            this._mediaGlobalService.addChangedToListener(this.onChangedToDropdownListener, MediaWidth.narrow);
        }
    }

    private buttonClickListener = (): void => {
        this._dropdown.toggleWithAnimation();

        if (this._dropdown.isExpanded()) {
            this._overlayService.activateOverlay(this._sectionMenuElement);
            this.updateDropdown();
        } else {
            this._overlayService.deactivateOverlay();
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

        this.updateDropdown();
    }

    private onChangedToSideMenuListener = (init: boolean): void => {
        this._menuMode = MenuMode.sideMenu;

        if (!init) {
            window.removeEventListener('resize', this.updateDropdown);
        }

        this.resetDropdown();

        window.addEventListener('resize', this.updateSideMenu);
        window.addEventListener('scroll', this.updateSideMenuDeferred);
        //Makes initial call to updateSideMenu (initial call is defined in the spec) - https://github.com/WICG/ResizeObserver/issues/8, unfortunately it is delayed
        this._bodyResizeObserver.observe(document.body);

        this.updateSideMenu();
    }

    // | MediaWidth | inCore2 | collapsed |
    // | narrow     | y/n     | y         |
    // | medium     | y       | y         |
    // | medium     | n       | n         |
    // | wide       | y/n     | n         |
    private updateDropdown = (): void => {
        if (this._menuMode === MenuMode.dropdown && this._dropdown.isExpanded()) { // Edge fires resize listeners even after they have been removed
            // Update wrapper maxheight so it is scrollable as a dropdown menu
            this._pagesInnerWrapperElement.style.maxHeight = `${window.innerHeight - SectionMenuComponent.HEADER_HEIGHT}px`;
        }
    }

    private resetDropdown = (): void => {
        this._pagesInnerWrapperElement.style.maxHeight = '';

        if (this._dropdown.isExpanded()) {
            this._overlayService.deactivateOverlay(false);
        }

        this._dropdown.reset();
    }

    // This function cannot be part of pages component because pages filter and section menu element state is required
    private updateSideMenu = (): void => {
        if (this._menuMode === MenuMode.sideMenu) { // ResizeObserver.Unobserve fires listeners in chrome
            let sectionMenuTop = this._sectionMenuElement.getBoundingClientRect().top;
            let footerTop = this._footerElement.getBoundingClientRect().top;

            let pagesHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
                - SectionMenuComponent.VERTICAL_GAP
                - this._filterHeight
                - Math.max(SectionMenuComponent.VERTICAL_GAP, sectionMenuTop);

            // Tried setting bottom, max-height, both don't work on edge - scroll bar doesn't go away even when height is greater than 
            // menu height. This works.
            this._sectionPagesElement.style.height = `${pagesHeight}px`;
        }

        this._updateSideMenuQueued = false;
    }

    private resetSideMenu = (): void => {
        this._sectionPagesElement.style.height = '';
    }

    private updateSideMenuDeferred = (): void => {
        if (!this._updateSideMenuQueued) {
            requestAnimationFrame(this.updateSideMenu);
            this._updateSideMenuQueued = true;
        }
    }
}
