import { injectable } from 'inversify';
import RootComponent from '../shared/rootComponent';

@injectable()
export default class PageFooterComponent extends RootComponent {
    private static readonly BUTTON_ACTIVE_CLASS = 'page-footer__back-to-top-button--active';

    private _footerButtonElementClassList: DOMTokenList;

    public constructor() {
        super();
    }

    public enabled(): boolean {
        // Footer always exists
        return true;
    }

    public setupOnDomInteractive(): void {
        this._footerButtonElementClassList = document.querySelector('.page-footer__back-to-top-button').classList;

        let pageHeaderElement = document.querySelector('.page-header');
        let intersectionObserver = new IntersectionObserver(this.onIntersectionListener, { threshold: 1 });
        intersectionObserver.observe(pageHeaderElement);
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    private onIntersectionListener = (entries: IntersectionObserverEntry[], _: IntersectionObserver) => {
        if (entries[0].intersectionRatio < 1) {
            this._footerButtonElementClassList.add(PageFooterComponent.BUTTON_ACTIVE_CLASS);
        } else {
            this._footerButtonElementClassList.remove(PageFooterComponent.BUTTON_ACTIVE_CLASS);
        }
    }
}
