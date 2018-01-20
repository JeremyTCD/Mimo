import Component from './component';

class FooterComponent extends Component {
    footerButtonElement: HTMLElement;

    protected validDomElementExists(): boolean {
        // Footer always exists
        return true;
    }

    protected setup(): void {
        this.footerButtonElement = document.getElementById('footer-button');

        this.setBackToTopButtonOpacity();
    }

    protected registerListeners(): void {
        window.addEventListener('resize', this.setBackToTopButtonOpacity);
    }

    public setBackToTopButtonOpacity = (): void => {
        if (this.footerButtonElement) {
            let visible = this.footerButtonElement.classList.contains('visible');
            let footerTop = document.querySelector('footer').getBoundingClientRect().top;
            let pageScrollable = document.body.offsetHeight > window.innerHeight;

            if (!visible && pageScrollable) {
                this.footerButtonElement.classList.add('visible');
            } else if (visible && !pageScrollable) {
                this.footerButtonElement.classList.remove('visible');
            }
        }
    }
}

export default new FooterComponent();