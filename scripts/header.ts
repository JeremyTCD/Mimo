import { toggleHeightForTransition } from './utils';
import navbarBuilder from './navbar';

class HeaderBuilder {

    build() {
        navbarBuilder.build(this.setupNavbarAndSearchAnimation);
    }

    setupNavbarAndSearchAnimation(): void {
        let wrapper = $('#header-navbar-and-search > .wrapper');

        $('#header-button').on('click', function () {
            toggleHeightForTransition(wrapper, wrapper);
        });

        $(window).on('resize', () => {
            if (wrapper.hasClass('expanded')) {
                wrapper.off('transitionend');
                wrapper.
                    css('height', 0).
                    removeClass('expanded');
            }
        });
    }
}

export default new HeaderBuilder();