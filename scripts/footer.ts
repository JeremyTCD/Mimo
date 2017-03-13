import Component from './component';

class Footer extends Component {
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
            $('footer a').css('visibility', 'visible');
        } else {
            $('footer a').css('visibility', 'hidden');
        }
    }
}

export default new Footer();