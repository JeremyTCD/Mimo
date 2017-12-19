export function toggleHeightForTransition(toggleHeightElement: JQuery, toggleClassElement: JQuery) {
    toggleHeightElement.off('transitionend');
    let initialHeight = toggleHeightElement.height();

    if (toggleClassElement.hasClass('expanded')) {
        toggleHeightElement.css('height', initialHeight);
        //trigger layout
        toggleHeightElement[0].clientHeight;
        toggleHeightElement.css('height', 0);
    } else {
        toggleHeightElement.css('height', 'auto');
        let expandedHeight = toggleHeightElement.height();

        toggleHeightElement.css('height', initialHeight);
        //trigger layout
        toggleHeightElement[0].clientHeight;
        toggleHeightElement.css('height', expandedHeight);

        toggleHeightElement.one('transitionend', () => {
            toggleHeightElement.css('height', 'auto');
        });
    }

    $(toggleClassElement).toggleClass('expanded');
}

export function contractHeightWithoutTransition(toggleHeightElement: JQuery, toggleClassElement: JQuery) {
    if (toggleClassElement.hasClass('expanded')) {
        toggleHeightElement.off('transitionend');
        toggleHeightElement.css('height', 0);
        $(toggleClassElement).removeClass('expanded');
    }
}

export function currentHeightToAutoHeight(element: HTMLElement) {
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

    element.addEventListener('transitionend', (event: Event) => {
        element.style.height = 'auto';
    });
}

export function autoHeightToFixedHeight(element: HTMLElement, fixedHeight: number) {
    let initialHeight = element.clientHeight;

    // Set initial height
    element.style.height = `${initialHeight}px`;

    // Trigger layout
    element.clientHeight;

    // Set fixed height
    element.style.height = `${fixedHeight}px`;
}