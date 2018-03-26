import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import NavbarComponent from './navbarComponent';
import SearchComponent from './searchComponent';
import SearchResultsComponent from './searchResultsComponent';
import HeightService from '../shared/heightService';
import OverlayService from '../shared/overlayService';
import MediaService from '../shared/mediaService';
import Component from '../shared/component';
import { MediaWidth } from '../shared/mediaWidth';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';

@injectable()
export default class PageHeaderComponent extends RootComponent {
    private _heightService: HeightService;
    private _overlayService: OverlayService;
    private _mediaService: MediaService;
    private _dropdownFactory: DropdownFactory;

    private _searchComponent: SearchComponent;

    private _pageHeaderElement: HTMLElement;
    private _buttonElement: HTMLElement;
    private _navbarAndSearchOuterWrapper: HTMLElement;
    private _navbarAndSearchInnerWrapper: HTMLElement;

    private _childComponents: Component[];
    private _dropdown: Dropdown;

    public constructor(
        dropdownFactory: DropdownFactory,
        heightService: HeightService,
        overlayService: OverlayService,
        mediaService: MediaService,
        searchComponent: SearchComponent,
        navbarComponent: NavbarComponent,
        searchResultsComponent: SearchResultsComponent) {
        super();

        this._dropdownFactory = dropdownFactory;
        this._heightService = heightService;
        this._overlayService = overlayService;
        this._mediaService = mediaService;
        this._searchComponent = searchComponent;

        this.addChildComponents(searchComponent, navbarComponent, searchResultsComponent);
    }

    public enabled(): boolean {
        // Header always exists
        return true;
    }

    public setupImmediate(): void {
        this.childComponentsSetupImmediate();
    }

    public setupOnDomContentLoaded(): void {
        this.childComponentsSetupOnDomContentLoaded();

        this._buttonElement = document.getElementById('page-header-button');
        this._navbarAndSearchOuterWrapper = document.getElementById('page-header-navbar-and-search-outer-wrapper');
        this._navbarAndSearchInnerWrapper = document.getElementById('page-header-navbar-and-search-inner-wrapper');
        this._pageHeaderElement = document.getElementById('page-header');

        this._dropdown = this._dropdownFactory.build(this._navbarAndSearchOuterWrapper, this._navbarAndSearchInnerWrapper, this._buttonElement, undefined);
    }

    public setupOnLoad(): void {
        this.childComponentsSetupOnLoad();
        this._buttonElement.addEventListener('click', this.buttonClickListener);
        window.addEventListener('resize', this.windowResizeListener);
    }

    private windowResizeListener = () => {
        // Going from wide/medium to narrow and search component has query
        if (this._mediaService.mediaWidthNarrow() &&
            this._mediaService.mediaWidthChanged() &&
            this._searchComponent.hasQuery()) {

            this._dropdown.expandWithoutAnimation();
        } else if (!this._mediaService.mediaWidthNarrow() && this._mediaService.getPreviousMediaWidth() === MediaWidth.narrow) {
            if (this._buttonElement.classList.contains('expanded') && !this._searchComponent.hasQuery()) {
                this._overlayService.deactivateOverlay(false);
            }

            // Going from narrow to wide/medium
            this._dropdown.reset()
        }
    }

    private buttonClickListener = () => {
        if (this._dropdown.isExpanded()) {
            this._searchComponent.reset();
            this._overlayService.deactivateOverlay();
        } else {
            this._overlayService.activateOverlay(this._pageHeaderElement, false);
        }

        this._dropdown.toggleWithAnimation();
    }
} 