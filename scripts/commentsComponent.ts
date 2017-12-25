import Component from './component';
import transitionsService from './transitionsService';

class CommentsComponent extends Component {
    disqusThread: HTMLElement;
    disqusShortname: string;
    disqusIdentifier: string;

    protected canInitialize(): boolean {
        this.disqusThread = document.getElementById('disqus_thread');

        if (!this.disqusThread) {
            return false;
        }

        this.disqusShortname = this.disqusThread.getAttribute('data-disqus-shortname');
        if (!this.disqusShortname) {
            console.log('Disqus enabled but shortname not specified.');

            document.getElementById('#comments').style.display = 'none';

            return false;
        }

        this.disqusIdentifier = this.disqusThread.getAttribute('data-disqus-identifier');
        if (!this.disqusIdentifier) {
            console.log('Disqus enabled but identifier not specified.');

            document.getElementById('#comments').style.display = 'none';

            return false;
        }

        return true;
    }

    protected setup(): void {
    }

    protected registerListeners(): void {
        if (!this.tryLoad()) {
            window.addEventListener('scroll', this.tryLoad);
        }
    }

    private tryLoad = (): boolean => {
        // top is relative to the top of the viewport, so as you scroll down, this number decreases
        let disqusTop: number = this.disqusThread.getBoundingClientRect().top;

        if (disqusTop < (window.innerHeight || document.documentElement.clientHeight)) {
            window.removeEventListener('scroll', this.tryLoad);

            let component = this;

            window['disqus_config'] = function () {
                this.page.url = `https://${location.host}${location.pathname}`;
                this.page.identifier = component.disqusIdentifier;
                this.callbacks.onReady.push(component.disqusOnReady);
            };

            let disqusScript: HTMLScriptElement = document.createElement('script');
            disqusScript.src = `https://${this.disqusShortname}.disqus.com/embed.js`;
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
        transitionsService.autoHeightToFixedHeight(commentsLoader, 0);
        commentsLoader.addEventListener('transitionend', this.commentsLoaderOnRemoved, true);

        // Disqus has some unusual behaviour whereby it it displays a login menu for a split 
        // second even if you are logged in (after the onready callback is called). This causes
        // an unavoidable jerk.
        transitionsService.currentHeightToAutoHeight(this.disqusThread);
    }

    private commentsLoaderOnRemoved = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.commentsLoaderOnRemoved, true);
            (event.target as HTMLElement).style.display = 'none';
        }
        event.stopPropagation();
    }
}

export default new CommentsComponent();