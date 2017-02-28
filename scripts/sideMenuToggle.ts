import { toggleHeightForTransition } from './utils';

class FooterBuilder {
    build() {
        this.setupToggle();
    }

    setupToggle(): void {
        let fitlerAndToc = $('.wrapper');

        $('#side-menu-toggle a').on('click', function () {
            toggleHeightForTransition(fitlerAndToc, fitlerAndToc);
        });
    }
}

export default new FooterBuilder();