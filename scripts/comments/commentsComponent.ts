import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import HeightService from '../shared/heightService';

@injectable()
export default class CommentsComponent extends RootComponent {
    private _disqusThreadElement: HTMLElement;
    private _disqusShortname: string;
    private _disqusIdentifier: string;
    private _heightService: HeightService;

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

    public registerListeners(): void {
        // Do nothing
    }

    public setupOnDomContentLoaded(): void {
        this._disqusShortname = this._disqusThreadElement.getAttribute('data-disqus-shortname');
        this._disqusIdentifier = this._disqusThreadElement.getAttribute('data-disqus-identifier');
    }

    public setupOnLoad(): void {
        // tryLoad requires fonts and resources to be loaded
        if (!this.tryLoad()) {
            window.addEventListener('scroll', this.tryLoad);
        }
    }

    private tryLoad = (): boolean => {
        // top is relative to the top of the viewport, so as you scroll down, this number decreases
        let disqusTop: number = this._disqusThreadElement.getBoundingClientRect().top;

        if (disqusTop < (window.innerHeight || document.documentElement.clientHeight)) {
            window.removeEventListener('scroll', this.tryLoad);

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

            return true;
        }

        return false;
    }

    private disqusOnReady = (): void => {
        let commentsLoader: HTMLElement = document.getElementById('comments-loader');

        commentsLoader.style.opacity = '0';
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
