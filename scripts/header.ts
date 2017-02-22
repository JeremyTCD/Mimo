import setupNavbar from './navbar';

export default function setupHeader(): void {
    setupNavbar();

    let animationWrapperHeight: number;
    let animationWrapper = $('#header-navbar-and-search > .animation-wrapper');

    function updateAnimationWrapperHeight(): void {
        animationWrapper.addClass('in');
        animationWrapper.css('height', 'auto');

        animationWrapperHeight = animationWrapper.outerHeight();

        animationWrapper.css('height', 0);
        animationWrapper.removeClass('in');
    }

    $('#header-button').on('click', function () {
        if (animationWrapper.hasClass('in')) {
            animationWrapper.removeClass('in');
            animationWrapper.css('height', 0);
        } else {
            animationWrapper.addClass('in');
            animationWrapper.css('height', animationWrapperHeight);
        }
    });

    updateAnimationWrapperHeight();
    $(window).on('resize', updateAnimationWrapperHeight);
}