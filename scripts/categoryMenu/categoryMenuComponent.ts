import { named, injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';
import ResizeObserver from 'resize-observer-polyfill';
import { MenuMode } from '../shared/menuMode';
import CollapsibleMenuFactory from '../shared/collapsibleMenuFactory';
import TextInputFactory from '../shared/textInputFactory';
import ThrottleService from '../shared/throttleService';

@injectable()
export default class CategoryMenuComponent extends RootComponent {
    public static readonly VERTICAL_GAP: number = 23;

    private _categoryMenuElement: HTMLElement;
    private _collapsibleMenuRootULElement: HTMLUListElement;
    private _pageFooterElement: HTMLElement;

    private _dropdown: Dropdown;
    private _bodyResizeObserver: ResizeObserver;
    private _menuMode: MenuMode
    private _updateCollapsibleMenuHeightThrottled: () => void;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') private _mediaGlobalService: MediaGlobalService,
        private _dropdownFactory: DropdownFactory,
        private _collapsibleMenuFactory: CollapsibleMenuFactory,
        private _textInputFactory: TextInputFactory,
        private _throttleService: ThrottleService) {
        super();
    }

    public enabled(): boolean {
        if (this._categoryMenuElement === undefined) {
            this._categoryMenuElement = document.querySelector('.category-menu');
        }

        return this._categoryMenuElement ? true : false;
    }

    public setupOnDomInteractive(): void {
        this._pageFooterElement = document.querySelector('.page-footer');
        this._collapsibleMenuRootULElement = this._categoryMenuElement.querySelector('.category-menu__collapsible-menu > ul');

        this._updateCollapsibleMenuHeightThrottled = this._throttleService.createThrottledFunction(this.updateCollapsibleMenuHeight);

        this._bodyResizeObserver = new ResizeObserver(this._updateCollapsibleMenuHeightThrottled);

        // Dropdown
        this._dropdown = this._dropdownFactory.build(this._categoryMenuElement);

        // Collapsible menu
        let collapsibleMenu = this._collapsibleMenuFactory.build(this._collapsibleMenuRootULElement.parentElement);

        // Collapsible menu filter - text input
        this._textInputFactory.
            build(this._categoryMenuElement.querySelector('.category-menu__filter-box'),
                (value: string) => { collapsibleMenu.filter(value); },
                () => { collapsibleMenu.restorePreFilterState(); });
    }

    public setupOnLoad(): void {
        let allMenus = document.body.classList.contains('body--all-menus');
        if (allMenus) {
            this._mediaGlobalService.addChangedFromListener(this.onChangedToDropdownListener, MediaWidth.wide);
            this._mediaGlobalService.addChangedToListener(this.onChangedToSideMenuListener, MediaWidth.wide);
        } else {
            this._mediaGlobalService.addChangedFromListener(this.onChangedToSideMenuListener, MediaWidth.narrow);
            this._mediaGlobalService.addChangedToListener(this.onChangedToDropdownListener, MediaWidth.narrow);
        }
    }

    private onChangedToDropdownListener = (init: boolean): void => {
        this._menuMode = MenuMode.dropdown;

        if (!init) {
            this._bodyResizeObserver.unobserve(document.body);
            window.removeEventListener('resize', this._updateCollapsibleMenuHeightThrottled);
            window.removeEventListener('scroll', this.updateCollapsibleMenuHeight);

            this._collapsibleMenuRootULElement.style.height = '';
        }
    }

    private onChangedToSideMenuListener = (_: boolean): void => {
        this._menuMode = MenuMode.sideMenu;

        this._dropdown.reset();

        window.addEventListener('resize', this._updateCollapsibleMenuHeightThrottled);
        window.addEventListener('scroll', this.updateCollapsibleMenuHeight);
        //Makes initial call to updateSideMenu (initial call is defined in the spec) - https://github.com/WICG/ResizeObserver/issues/8, unfortunately it is delayed
        this._bodyResizeObserver.observe(document.body);

        this._updateCollapsibleMenuHeightThrottled();
    }

    private updateCollapsibleMenuHeight = (): void => {
        if (this._menuMode !== MenuMode.sideMenu) { // ResizeObserver.Unobserve fires listeners in chrome
            return;
        }

        let collapsibleMenuTop = this._collapsibleMenuRootULElement.getBoundingClientRect().top;
        let footerTop = this._pageFooterElement.getBoundingClientRect().top;

        // Account for top padding
        let collapsibleMenuHeight = (footerTop > window.innerHeight ? window.innerHeight : footerTop)
            - CategoryMenuComponent.VERTICAL_GAP // Gap between category menu pages and footer/bottom of page
            - collapsibleMenuTop;

        // Setting style.bottom doesn't work on Edge
        this._collapsibleMenuRootULElement.style.height = `${collapsibleMenuHeight}px`;
    }
}
