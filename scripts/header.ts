import { toggleHeightForTransition, contractHeightWithoutTransition } from './utils';
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
            contractHeightWithoutTransition(wrapper, wrapper);
        });
    }
}

export default new HeaderBuilder();