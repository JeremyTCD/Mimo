import OverlayManager from './overlayManager';

class OverlayManagerFactory {
    public build(...overlayIDs: string[]): OverlayManager {
        let overlayElements: HTMLElement[] = [];

        for (let i = 0; i < overlayIDs.length; i++) {
            overlayElements.push(document.getElementById(overlayIDs[i]));
        }

        return new OverlayManager(overlayElements);
    }
}

export default new OverlayManagerFactory();