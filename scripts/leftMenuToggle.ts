import { toggleHeightForTransition } from './utils';

class LeftMenuToggleBuilder {
    build() {
        this.setupToggle();
    }

    setupToggle(): void {
        let fitlerAndToc = $('#left-menu');

        $('#left-menu-toggle a').on('click', function () {
            toggleHeightForTransition(fitlerAndToc, fitlerAndToc);
        });
    }
}

export default new LeftMenuToggleBuilder();