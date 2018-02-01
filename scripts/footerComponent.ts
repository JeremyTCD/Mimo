import Component from './component';
import ResizeObserver from 'resize-observer-polyfill';
import debounceService from './debounceService';

class FooterComponent extends Component {
    footerButtonElement: HTMLElement;
    debounceTime: number = 150;

    protected validDomElementExists(): boolean {
        // Footer always exists
        return true;
    }

    protected setup(): void {
        this.footerButtonElement = document.getElementById('footer-button');

        // ResizeObserver typically makes an initial call to setBackToTopButtonOpacity because other js scripts modify dom elements in body when page is loading,
        // not reliable though.
        this.setBackToTopButtonOpacity();
    }

    protected registerListeners(): void {
        // A selling point of ResizeObserver is that it provides dimensions so layouts can be avoided - https://developers.google.com/web/updates/2016/10/resizeobserver
        // Consider utilizing those values.
        const resizeObserver = new ResizeObserver(debounceService.createTimeoutDebounceFunction(this.setBackToTopButtonOpacity, this.debounceTime));

        resizeObserver.observe(document.body);
    }

    private setBackToTopButtonOpacity = (): void => {
        if (this.footerButtonElement) {
            let visible = this.footerButtonElement.classList.contains('visible');

            // This is a hack for getting around android chrome and ios safari url bars.
            // 100vh corresponds to the viewport height + the url bar height on both and is fixed - https://developers.google.com/web/updates/2016/12/url-bar-resizing.
            // If body.offsetHeight is === (viewport height + url bar height), there will be no verical scrollbar since url bar just scrolls out. 
            // 100vh is just viewport height (window.innerHeight) on normal browsers, so this is safe for them.
            let documentElementStyle = getComputedStyle(document.documentElement);
            let viewportHeight = parseFloat(documentElementStyle.height);
            let pageScrollable = document.body.offsetHeight > viewportHeight;

            if (!visible && pageScrollable) {
                this.footerButtonElement.classList.add('visible');
            } else if (visible && !pageScrollable) {
                this.footerButtonElement.classList.remove('visible');
            }
        }
    }
}

export default new FooterComponent();