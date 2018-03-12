export default class OverlayManager {
    constructor(private overlayElements: HTMLElement[]) {
    }

    public activateOverlays() {
        for (let i = 0; i < this.overlayElements.length; i++) {
            this.overlayElements[i].classList.add('active');
        }
    }

    public deactivateOverlays() {
        for (let i = 0; i < this.overlayElements.length; i++) {
            this.overlayElements[i].classList.remove('active');
        }
    }
}