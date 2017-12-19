class TransitionsService {
    public toggleHeightForTransition (toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);

        if (toggleClassElement.classList.contains('expanded')) {
            this.autoHeightToFixedHeight(toggleHeightElement, 0);
        } else {
            this.currentHeightToAutoHeight(toggleHeightElement);
        }

        toggleClassElement.classList.toggle('expanded');
    }

    public contractHeightWithoutTransition (toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        if (toggleClassElement.classList.contains('expanded')) {
            toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);
            toggleHeightElement.style.height = '0px';
            toggleClassElement.classList.remove('expanded');
        }
    }

    public currentHeightToAutoHeight (element: HTMLElement): void {
        let initialHeight = element.clientHeight;

        // Get auto height
        element.style.height = 'auto';
        let autoHeight = element.clientHeight;

        // Reset to initial height
        element.style.height = `${initialHeight}px`;

        // Trigger layout
        element.clientHeight;

        // Set auto height
        element.style.height = `${autoHeight}px`;

        element.addEventListener('transitionend', this.setHeightAutoListener, true);
    }

    public autoHeightToFixedHeight (element: HTMLElement, fixedHeight: number): void {
        let initialHeight = element.clientHeight;

        // Set initial height
        element.style.height = `${initialHeight}px`;

        // Trigger layout
        element.clientHeight;

        // Set fixed height
        element.style.height = `${fixedHeight}px`;
    }

    private setHeightAutoListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.setHeightAutoListener, true);
            (event.target as HTMLElement).style.height = 'auto';
        }
        event.stopPropagation();
    }
}

export default new TransitionsService();