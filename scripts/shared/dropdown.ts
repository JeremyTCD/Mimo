import { injectable } from "inversify";
import OverlayService from "./overlayService";

@injectable()
export default class Dropdown {
    private static readonly HEADER_HEIGHT = 37;
    private static readonly DROPDOWN_EXPANDED_CLASS = 'dropdown--expanded';
    private static readonly DROPDOWN_ENABLE_ANIMATION_CLASS = 'dropdown--enable-animation';
    private static readonly DROPDOWN_COLLAPSING_CLASS = 'dropdown--collapsing';

    private _dropdownBodyElement: HTMLElement;
    private _rootElementClassList: DOMTokenList;
    private _overlayActivationID: number;

    public constructor(private _rootElement: HTMLElement,
        private _overlayService: OverlayService,
        private _onExpand?: () => void,
        private _onCollapse?: () => void,
        private _onDropdownButtonClick?: () => void,
        private _defaultTranslateToTop = true,
        private _defaultAnimate = true,
        private _defaultDisableBodyScroll = true,
        private _defaultLimitDropdownBodyMaxHeight = true) {
        this._dropdownBodyElement = _rootElement.querySelector('.dropdown__body');
        _rootElement.querySelector('.dropdown__button').addEventListener('click', this.dropdownButtonClickListener, true);
        this._rootElementClassList = _rootElement.classList;
    }

    public expand(translateToTop: boolean = true,
        animate: boolean = true,
        disableBodyScroll: boolean = true,
        limitDropdownBodyMaxHeight: boolean = true) {
        if (this.isExpanded()) {
            return;
        }

        if (this._onExpand) {
            this._onExpand();
        }

        let windowInnerHeight: number;
        if (limitDropdownBodyMaxHeight) {
            windowInnerHeight = window.innerHeight; // Read before any writes to avoid unecessary layout
        }

        let top: number;
        if (translateToTop) {
            top = this._rootElement.offsetTop - window.scrollY; // Read before any writes to avoid unecessary layout
        }

        this._overlayActivationID = this._overlayService.activateOverlay(this.overlayOnClick, animate, disableBodyScroll);

        if (translateToTop) {
            this._rootElement.style.transform = `translateY(${-top}px)`;
        }

        if (this.isCollapsing()) {
            this._rootElementClassList.remove(Dropdown.DROPDOWN_COLLAPSING_CLASS);
            this._dropdownBodyElement.removeEventListener('transitionend', this.onCollapsedListener, true);
        }

        if (animate) {
            this._rootElementClassList.add(Dropdown.DROPDOWN_ENABLE_ANIMATION_CLASS);
        } else {
            this._rootElementClassList.remove(Dropdown.DROPDOWN_ENABLE_ANIMATION_CLASS);
        }

        if (limitDropdownBodyMaxHeight) {
            this._dropdownBodyElement.style.maxHeight = `${windowInnerHeight - Dropdown.HEADER_HEIGHT}px`;
            window.addEventListener('resize', this.setDropdownBodyMaxHeight);
        }

        this._rootElementClassList.add(Dropdown.DROPDOWN_EXPANDED_CLASS);
    }

    public collapse(animate: boolean = true) {
        if (!this.isExpanded()) {
            return;
        }

        if (this._onCollapse) {
            this._onCollapse();
        }

        this._rootElementClassList.remove(Dropdown.DROPDOWN_EXPANDED_CLASS);
        this._rootElement.style.transform = '';

        if (animate) {
            this._rootElementClassList.add(Dropdown.DROPDOWN_ENABLE_ANIMATION_CLASS, Dropdown.DROPDOWN_COLLAPSING_CLASS);
            this._dropdownBodyElement.addEventListener('transitionend', this.onCollapsedListener, true);
        }
        else {
            this._rootElementClassList.remove(Dropdown.DROPDOWN_ENABLE_ANIMATION_CLASS);
        }

        this._overlayService.deactivateOverlay(this._overlayActivationID, animate);

        window.removeEventListener('resize', this.setDropdownBodyMaxHeight);
    }

    public reset(disableOverlay: boolean = true, deactivateOverlay: boolean = false) {
        if (!this.isCollapsed()) {
            if (disableOverlay) {
                this._overlayService.reset();
            } else if (deactivateOverlay) {
                this._overlayService.deactivateOverlay(this._overlayActivationID);
            }
        }

        this._dropdownBodyElement.style.maxHeight = '';
        this._dropdownBodyElement.removeEventListener('transitionend', this.onCollapsedListener, true);
        this._rootElement.style.transform = '';
        this._rootElementClassList.remove(Dropdown.DROPDOWN_EXPANDED_CLASS, Dropdown.DROPDOWN_ENABLE_ANIMATION_CLASS, Dropdown.DROPDOWN_COLLAPSING_CLASS);
    }

    public isExpanded() {
        return this._rootElementClassList.contains(Dropdown.DROPDOWN_EXPANDED_CLASS);
    }

    public isCollapsing() {
        return this._rootElementClassList.contains(Dropdown.DROPDOWN_COLLAPSING_CLASS);
    }

    public isCollapsed() {
        return !this.isExpanded() && !this.isCollapsing();
    }

    private dropdownButtonClickListener = (event: Event): void => {
        if (this._onDropdownButtonClick) {
            this._onDropdownButtonClick();
        }

        if (this.isExpanded()) {
            this.collapse(this._defaultAnimate);
        } else {
            this.expand(this._defaultTranslateToTop, this._defaultAnimate, this._defaultDisableBodyScroll, this._defaultLimitDropdownBodyMaxHeight);
        }

        event.preventDefault();
        event.stopImmediatePropagation(); // Tippy and smooth-scroll register listeners for all click events, prevent them from firing unecessarily
    }

    private setDropdownBodyMaxHeight = (): void => {
        // Set maxheight so body is scrollable
        this._dropdownBodyElement.style.maxHeight = `${window.innerHeight - Dropdown.HEADER_HEIGHT}px`;
    }

    private onCollapsedListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            this._dropdownBodyElement.removeEventListener('transitionend', this.onCollapsedListener, true);
            this._rootElementClassList.remove(Dropdown.DROPDOWN_COLLAPSING_CLASS);
            event.stopPropagation();
        }
    }

    private overlayOnClick = (): void => {
        this.collapse(this._defaultAnimate);
    }
}
