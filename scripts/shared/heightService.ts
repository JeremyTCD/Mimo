import { injectable, inject } from "inversify";

@injectable()
export default class HeightService {
    public toggleHeightWithTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);

        if (toggleClassElement.classList.contains('expanded')) {
            this.autoHeightToFixedHeightWithTransition(toggleHeightElement, 0);
        } else {
            this.currentHeightToAutoHeightWithTransition(toggleHeightElement);
        }

        toggleClassElement.classList.toggle('expanded');
    }

    public toggleHeightWithoutTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);

        if (toggleClassElement.classList.contains('expanded')) {
            this.autoHeightToFixedHeightWithoutTransition(toggleHeightElement, 0);
        } else {
            this.currentHeightToAutoHeightWithoutTransition(toggleHeightElement);
        }

        toggleClassElement.classList.toggle('expanded');
    }

    public contractHeightWithoutTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);
        this.autoHeightToFixedHeightWithoutTransition(toggleHeightElement, 0);
        toggleClassElement.classList.remove('expanded');
    }

    public expandHeightWithoutTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);
        this.currentHeightToAutoHeightWithoutTransition(toggleHeightElement);
        toggleClassElement.classList.add('expanded');
    }

    public reset(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement): void {
        toggleHeightElement.style.height = 'auto';
        toggleClassElement.classList.remove('expanded');
    }

    public currentHeightToAutoHeightWithTransition(element: HTMLElement): void {
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

    public currentHeightToAutoHeightWithoutTransition(element: HTMLElement): void {
        element.style.height = 'auto';
    }

    public autoHeightToFixedHeightWithTransition(element: HTMLElement, fixedHeight: number): void {
        let initialHeight = element.clientHeight;

        // Set initial height
        element.style.height = `${initialHeight}px`;

        // Trigger layout
        element.clientHeight;

        // Set fixed height
        element.style.height = `${fixedHeight}px`;

        element.addEventListener('transitionend', this.setHeightFixedListener, true);
    }

    public autoHeightToFixedHeightWithoutTransition(element: HTMLElement, fixedHeight: number): void {
        element.style.height = `${fixedHeight}px`;
    }

    private setHeightFixedListener = (event: Event): void => {
    }

    private setHeightAutoListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.setHeightAutoListener, true);
            (event.target as HTMLElement).style.height = 'auto';
        }
        event.stopPropagation();
    }
}
