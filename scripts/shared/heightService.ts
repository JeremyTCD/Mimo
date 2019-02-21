import { injectable } from "inversify";

// TODO would be much more performant if it only uses transforms (FLIP)
@injectable()
export default class HeightService {
    public toggleHeightWithTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement, expandedClass: string): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);

        if (toggleClassElement.classList.contains(expandedClass)) {
            this.autoHeightToFixedHeightWithTransition(toggleHeightElement, 0);
        } else {
            this.currentHeightToAutoHeightWithTransition(toggleHeightElement);
        }

        toggleClassElement.classList.toggle(expandedClass);
    }

    public toggleHeightWithoutTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement, expandedClass: string): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);

        if (toggleClassElement.classList.contains(expandedClass)) {
            this.autoHeightToFixedHeightWithoutTransition(toggleHeightElement, 0);
        } else {
            this.currentHeightToAutoHeightWithoutTransition(toggleHeightElement);
        }

        toggleClassElement.classList.toggle(expandedClass);
    }

    public contractHeightWithoutTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement, expandedClass: string): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);
        this.autoHeightToFixedHeightWithoutTransition(toggleHeightElement, 0);
        toggleClassElement.classList.remove(expandedClass);
    }

    public expandHeightWithoutTransition(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement, expandedClass: string): void {
        toggleHeightElement.removeEventListener('transitionend', this.setHeightAutoListener, true);
        this.currentHeightToAutoHeightWithoutTransition(toggleHeightElement);
        toggleClassElement.classList.add(expandedClass);
    }

    public reset(toggleHeightElement: HTMLElement, toggleClassElement: HTMLElement, expandedClass: string): void {
        toggleHeightElement.style.height = 'auto';
        toggleClassElement.classList.remove(expandedClass);
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
    }

    public autoHeightToFixedHeightWithoutTransition(element: HTMLElement, fixedHeight: number): void {
        element.style.height = `${fixedHeight}px`;
    }

    private setHeightAutoListener = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.setHeightAutoListener, true);
            (event.target as HTMLElement).style.height = 'auto';
            event.stopPropagation();
        }
    }
}
