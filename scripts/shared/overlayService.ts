import { injectable } from 'inversify';

@injectable()
export default class OverlayService {
    private static readonly OVERLAY_ACTIVE_CLASS = 'overlay--active';
    private static readonly OVERLAY_DEACTIVATING_CLASS = 'overlay--deactivating';
    private static readonly OVERLAY_ENABLE_ANIMATION_CLASS = 'overlay--enable-animation';

    private _overlayElement: HTMLElement;
    private _overlayElementClassList: DOMTokenList;
    private _onClickListeners: { (): void }[] = [];
    private _numActivations: number = 0;

    public constructor() {
        this._overlayElement = document.querySelector('.overlay');
        this._overlayElementClassList = this._overlayElement.classList;
    }

    public activateOverlay(onClick: { (): void }, animate: boolean = true, disableBodyScroll: boolean = true): number {
        // If there are multiple requests to activate overlay, save each one's onClick listener
        let activationID = this.addOnClickListener(onClick);
        this._numActivations++;

        if (this.isActive()) {
            return activationID;
        }

        let scrollBarWidth: number;
        if (disableBodyScroll) {
            scrollBarWidth = window.innerWidth - document.documentElement.clientWidth; // Perform reads first
        }

        if (this.isDeactivating()) {
            this._overlayElement.removeEventListener('transitionend', this.onFadedOutListener, true);
            this._overlayElementClassList.remove(OverlayService.OVERLAY_DEACTIVATING_CLASS);
        }

        if (animate) {
            this._overlayElementClassList.add(OverlayService.OVERLAY_ENABLE_ANIMATION_CLASS);
        } else {
            this._overlayElementClassList.remove(OverlayService.OVERLAY_ENABLE_ANIMATION_CLASS);
        }

        this._overlayElementClassList.add(OverlayService.OVERLAY_ACTIVE_CLASS);

        if (disableBodyScroll) {
            this.disableBodyScroll(scrollBarWidth);
        }

        this._overlayElement.addEventListener('click', this.overlayClickListener);

        return activationID;
    }

    public deactivateOverlay(activationID: number, animate: boolean = true) {
        if (!this.isActive()) {
            return;
        }

        this.removeOnClickListener(activationID);

        if (--this._numActivations > 0) { // Other activations still require overlay
            return;
        }
        else if (this._numActivations === -1) {
            console.warn('OverlayService: Overlay active despite there being no activations.');
            this._numActivations = 0; // Reset to 0 and proceed with deactivation
        }

        this._overlayElementClassList.remove(OverlayService.OVERLAY_ACTIVE_CLASS);
        this._overlayElement.removeEventListener('click', this.overlayClickListener);

        if (animate) {
            this._overlayElementClassList.add(OverlayService.OVERLAY_ENABLE_ANIMATION_CLASS);
            this._overlayElementClassList.add(OverlayService.OVERLAY_DEACTIVATING_CLASS);
            this._overlayElement.addEventListener('transitionend', this.onFadedOutListener, true);
        } else {
            this._overlayElementClassList.remove(OverlayService.OVERLAY_ENABLE_ANIMATION_CLASS);
            this.enableBodyScroll();
        }
    }

    public reset() {
        this._overlayElementClassList.remove(OverlayService.OVERLAY_ACTIVE_CLASS, OverlayService.OVERLAY_DEACTIVATING_CLASS, OverlayService.OVERLAY_ENABLE_ANIMATION_CLASS);
        this._overlayElement.removeEventListener('click', this.overlayClickListener);
        this._overlayElement.removeEventListener('transitionend', this.onFadedOutListener, true);
        this._onClickListeners = [];
        this._numActivations = 0;

        this.enableBodyScroll();
    }

    private addOnClickListener(onClick: () => void): number {
        if (onClick) {
            let arrLength = this._onClickListeners.length;

            for (let i = 0; i < arrLength; i++) {
                if (!this._onClickListeners[i]) {
                    this._onClickListeners[i] = onClick;
                    return i;
                }
            }

            this._onClickListeners.push(onClick);

            return arrLength;
        } else {
            return -1;
        }
    }

    private removeOnClickListener(activationID: number): void {
        if (activationID > -1) {
            this._onClickListeners[activationID] = null;
        }
    }

    private overlayClickListener = (event: Event): void => {
        if (!this.isActive()) {
            return;
        }

        for (let i = 0; i < this._onClickListeners.length; i++) {
            let onClickListener = this._onClickListeners[i];
            if (onClickListener) {
                onClickListener();
                this._onClickListeners[i] = null;
            }
        }

        event.preventDefault();
        event.stopImmediatePropagation(); // Avoid running smooth-scroll and tippy listeners
    }

    private onFadedOutListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            this._overlayElement.removeEventListener('transitionend', this.onFadedOutListener, true);
            this.enableBodyScroll(); // Wait until overlay has deactivated before allowing scrolling
            this._overlayElementClassList.remove(OverlayService.OVERLAY_DEACTIVATING_CLASS);
            event.stopPropagation();
        }
    }

    private isActive(): boolean {
        return this._overlayElementClassList.contains(OverlayService.OVERLAY_ACTIVE_CLASS);
    }

    private isDeactivating(): boolean {
        return this._overlayElementClassList.contains(OverlayService.OVERLAY_DEACTIVATING_CLASS);
    }

    private enableBodyScroll() {
        document.body.style.borderRight = '';
        document.body.style.overflow = '';
    }

    private disableBodyScroll(scrollBarWidth: number) {
        if (scrollBarWidth > 0) {
            document.body.style.borderRight = `${scrollBarWidth}px solid black`;
        }
        document.body.style.overflow = 'hidden';
    }
}