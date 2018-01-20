import Component from './component';
import ResizeObserver from 'resize-observer-polyfill'

class FooterComponent extends Component {
    footerButtonElement: HTMLElement;

    protected validDomElementExists(): boolean {
        // Footer always exists
        return true;
    }

    protected setup(): void {
        this.footerButtonElement = document.getElementById('footer-button');
    }

    protected registerListeners(): void {
        const resizeObserver = new ResizeObserver((entries, observer) => {
            // A selling point of ResizeObserver is that it provides dimensions so layouts can be avoided - https://developers.google.com/web/updates/2016/10/resizeobserver
            // Consider utilizing those values.
            this.setBackToTopButtonOpacity();
        });
        // Note: Makes initial call to setBackToTopButtonOpacity
        resizeObserver.observe(document.body);
    }

    private setBackToTopButtonOpacity = (): void => {
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