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
