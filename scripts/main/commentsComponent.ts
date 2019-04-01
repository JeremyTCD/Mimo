import { injectable } from 'inversify';
import Component from '../shared/component';
import HeightService from '../shared/heightService';

@injectable()
export default class CommentsComponent implements Component {
    private _commentsElement: HTMLElement;
    private _disqusThreadElement: HTMLElement;
    private _spinner: HTMLElement;

    private _disqusShortname: string;
    private _disqusIdentifier: string;
    private _intersectionObserver: IntersectionObserver;

    public constructor(private _heightService: HeightService) {
    }

    public enabled(): boolean {
        if (this._commentsElement === undefined) {
            this._commentsElement = document.getElementById('comments');
        }

        return this._commentsElement ? true : false;
    }

    public setupOnDomInteractive(): void {
        this._disqusThreadElement = document.getElementById('disqus_thread');
        this._spinner = document.getElementById('disqus-spinner');
        this._disqusShortname = this._disqusThreadElement.getAttribute('data-disqus-shortname');
        this._disqusIdentifier = this._disqusThreadElement.getAttribute('data-disqus-identifier');
    }

    public setupOnLoad(): void {
        this._intersectionObserver = new IntersectionObserver(this.onIntersect);

        this._intersectionObserver.observe(this._commentsElement);
    }

    private onIntersect = (entries: IntersectionObserverEntry[], _: IntersectionObserver): void => {
        // Some browsers make an initial call to the callback, regardless of whether there is any intersection
        if (entries[0].intersectionRatio === 0) {
            return;
        }

        this._spinner.classList.add('active');

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
            event.stopPropagation();
        }
    }
}
