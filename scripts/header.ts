import { toggleHeightForTransition } from './utils';
import navbarBuilder from './navbar';

class HeaderBuilder {

    build() {
        navbarBuilder.build(this.setupNavbarAndSearchAnimation);
    }

    setupNavbarAndSearchAnimation(): void {
        let animationWrapper = $('#header-navbar-and-search > .animation-wrapper');

        $('#header-button').on('click', function () {
            toggleHeightForTransition(animationWrapper, animationWrapper);
        });

        $(window).on('resize', () => {
            if (animationWrapper.hasClass('expanded')){
                animationWrapper.
                    css('height', 0).
                    removeClass('expanded');
            }
        });
    }
}

export default new HeaderBuilder();