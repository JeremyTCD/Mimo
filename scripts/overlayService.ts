class OverlayService {
    overlayElement: HTMLElement;

    public activateOverlay() {
        if (!this.overlayElement) {
            this.overlayElement = document.getElementById('overlay');
        }

        this.overlayElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    public deactivateOverlay() {
        if (this.overlayElement) {
            this.overlayElement.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

}

export default new OverlayService();