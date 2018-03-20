import { injectable, inject } from 'inversify';

@injectable()
export default class OverlayService {
    private _overlayElement: HTMLElement;
    private _currentFocusedElement: HTMLElement;
    private _overlayActive: boolean;

    public activateOverlay(focusedElement: HTMLElement, disableBodyScroll: boolean = true, fadeIn: boolean = true) {

        if (!this._overlayActive) {
            if (!this._overlayElement) {
                this._overlayElement = document.getElementById('overlay');
            } else {
                this._overlayElement.removeEventListener('transitionend', this.onFadedOutListener, true);
            }

            this._overlayActive = true;

            // Update overlay element
            this._overlayElement.style.visibility = 'visible';
            this._overlayElement.style.opacity = '0.7';

            if (!fadeIn) {
                this._overlayElement.style.transition = 'initial';
            } else {
                this._overlayElement.style.transition = '';
            } 

            // Update focused element
            this._currentFocusedElement = focusedElement;
            this._currentFocusedElement.style.zIndex = '3';

            // Update body
            if (disableBodyScroll) {
                document.body.style.overflow = 'hidden';
            }

        } else {
            console.warn(`Overlay already active, unable to focus on ${focusedElement}.`);
        }
    }

    public deactivateOverlay(fadeOut: boolean = true) {

        if (this._overlayActive) {
            this._overlayElement.removeEventListener('transitionend', this.onFadedOutListener, true);
            this._overlayActive = false;

            this._overlayElement.style.opacity = '0';

            if (!fadeOut) {
                this.resetElements();
            } else {
                this._overlayElement.addEventListener('transitionend', this.onFadedOutListener, true);
            }
        } else {
            console.warn(`Overlay inactive, nothing to deactivate.`);
        }
    }

    private onFadedOutListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.onFadedOutListener, true);
            this.resetElements();
        }
        event.stopPropagation();
    }

    private resetElements() {
        // Update overlay element
        this._overlayElement.style.visibility = '';
        this._overlayElement.style.transition = '';

        // Update focused element
        this._currentFocusedElement.style.zIndex = '';
        this._currentFocusedElement = null;

        // Update body
        document.body.style.overflow = '';
    }

}