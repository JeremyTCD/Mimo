import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import HeightService from '../shared/heightService';

@injectable()
export default class CommentsComponent extends RootComponent {
    private _disqusThreadElement: HTMLElement;
    private _disqusShortname: string;
    private _disqusIdentifier: string;
    private _heightService: HeightService;
    private _intersectionObserver: IntersectionObserver;
    private _initialCallMade: boolean;

    public constructor(heightService: HeightService) {

        super();
        this._heightService = heightService;
    }

    public setupImmediate(): void {
        this._disqusThreadElement = document.getElementById('disqus_thread');
    }

    public enabled(): boolean {
        return this._disqusThreadElement ? true : false;
    }

    public setupOnDomContentLoaded(): void {
        this._disqusShortname = this._disqusThreadElement.getAttribute('data-disqus-shortname');
        this._disqusIdentifier = this._disqusThreadElement.getAttribute('data-disqus-identifier');
    }

    public setupOnLoad(): void {
        this._intersectionObserver = new IntersectionObserver(this.onIntersect);

        this._initialCallMade = false;
        this._intersectionObserver.observe(this._disqusThreadElement);
    }

    private onIntersect = (): void => {
        if (!this._initialCallMade) {
            this._initialCallMade = true;
            return;
        }


        this._intersectionObserver.disconnect();
        this._intersectionObserver = null;

        let component = this;

        window['disqus_config'] = function () {
            this.page.url = `https://${location.host}${location.pathname}`;
            this.page.identifier = component._disqusIdentifier;
            this.callbacks.onReady.push(component.disqusOnReady);
        };

        let disqusScript: HTMLScriptElement = document.createElement('script');
        disqusScript.src = `https://${this._disqusShortname}.disqus.com/embed.js`;
        disqusScript.setAttribute('data-timestamp', Date.now().toString());

        (document.head || document.body).appendChild(disqusScript);

        console.log('Disqus embed script inserted.');

    }

    private disqusOnReady = (): void => {
        let commentsLoader: HTMLElement = document.getElementById('comments-loader');

        commentsLoader.style.opacity = '0';
        // Can't use transform here, need to trigger layouts so that footer gets pushed down
        this._heightService.autoHeightToFixedHeightWithTransition(commentsLoader, 0);
        commentsLoader.addEventListener('transitionend', this.commentsLoaderOnRemoved, true);

        // Disqus has some unusual behaviour whereby it it displays a login menu for a split 
        // second even if you are logged in (after the onready callback is called). This causes
        // an unavoidable jerk.
        this._heightService.currentHeightToAutoHeightWithTransition(this._disqusThreadElement);
    }

    private commentsLoaderOnRemoved = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.commentsLoaderOnRemoved, true);
            (event.target as HTMLElement).style.display = 'none';
        }
        event.stopPropagation();
    }
}
