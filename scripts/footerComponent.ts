import Component from './component';

class FooterComponent extends Component {
    protected canInitialize(): boolean {
        return true;
    }

    protected setup(): void {
        this.setBackToTopOpacity();
    }

    protected registerListeners(): void {
        $(window).on('resize', this.setBackToTopOpacity);
    }

    private setBackToTopOpacity(): void {
        if ($("body").height() > $(window).height()) {
            $('#footer-button').css('visibility', 'visible');
        } else {
            $('#footer-button').css('visibility', 'hidden');
        }
    }
}

export default new FooterComponent();