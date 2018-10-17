import { named, injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import SearchComponent from './searchComponent';
import SearchResultsComponent from './searchResultsComponent';
import OverlayService from '../shared/overlayService';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';

@injectable()
export default class PageHeaderComponent extends RootComponent {
    private _overlayService: OverlayService;
    private _mediaGlobalService: MediaGlobalService;
    private _dropdownFactory: DropdownFactory;

    private _searchComponent: SearchComponent;

    private _pageHeaderElement: HTMLElement;
    private _buttonElement: HTMLElement;
    private _navbarAndSearchOuterWrapper: HTMLElement;
    private _navbarAndSearchInnerWrapper: HTMLElement;

    private _dropdown: Dropdown;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService,
        dropdownFactory: DropdownFactory,
        overlayService: OverlayService,
        searchComponent: SearchComponent,
        searchResultsComponent: SearchResultsComponent) {
        super();

        this._dropdownFactory = dropdownFactory;
        this._overlayService = overlayService;
        this._mediaGlobalService = mediaGlobalService;
        this._searchComponent = searchComponent;

        this.addChildComponents(searchComponent, searchResultsComponent);
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
        this._overlayService.addClickListener(this.overlayClickListener);

        this._mediaGlobalService.addChangedFromListener(this.onChangedFromNarrowListener, MediaWidth.narrow);
        this._mediaGlobalService.addChangedToListener(this.onChangedToNarrowListener, MediaWidth.narrow);
    }

    private onChangedToNarrowListener = () => {
        if (this._searchComponent.hasQuery()) {
            this._dropdown.expandWithoutAnimation();
        }
    }

    private onChangedFromNarrowListener = () => {
        if (this._dropdown.isExpanded() && !this._searchComponent.hasQuery()) {
            this._overlayService.deactivateOverlay(false);
        }

        this._dropdown.reset()
    }

    private overlayClickListener = (): void => {
        if (this._searchComponent.hasQuery()) {
            this._searchComponent.reset();
        } 

        if (this._dropdown.isExpanded()) {
            this._overlayService.deactivateOverlay();
            this._dropdown.collapseWithAnimation();
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