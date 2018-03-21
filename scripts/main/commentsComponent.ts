import Component from './component';
import transitionsService from './transitionsService';
import articleMenuComponent from './articleMenuComponent';
import sectionMenuComponent from './sectionMenuComponent';

class CommentsComponent extends Component {
    disqusThreadElement: HTMLElement = document.getElementById('disqus_thread');
    disqusShortname: string;
    disqusIdentifier: string;

    protected validDomElementExists(): boolean {
        return this.disqusThreadElement ? true : false;
    }

    protected registerListeners(): void {
        if (!this.tryLoad()) {
            window.addEventListener('scroll', this.tryLoad);
        }
    }

    protected setupOnDomContentLoaded(): void {
        this.disqusShortname = this.disqusThreadElement.getAttribute('data-disqus-shortname');
        this.disqusIdentifier = this.disqusThreadElement.getAttribute('data-disqus-identifier');
    }

    protected setupOnLoad(): void {
        // Do nothing
    }

    private tryLoad = (): boolean => {
        // top is relative to the top of the viewport, so as you scroll down, this number decreases
        let disqusTop: number = this.disqusThreadElement.getBoundingClientRect().top;

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
        transitionsService.autoHeightToFixedHeightWithTransition(commentsLoader, 0);
        commentsLoader.addEventListener('transitionend', this.commentsLoaderOnRemoved, true);

        // Disqus has some unusual behaviour whereby it it displays a login menu for a split 
        // second even if you are logged in (after the onready callback is called). This causes
        // an unavoidable jerk.
        transitionsService.currentHeightToAutoHeightWithTransition(this.disqusThreadElement);
    }

    private commentsLoaderOnRemoved = (event: Event): void => {
        if (event.target === event.currentTarget) {
            event.target.removeEventListener('transitionend', this.commentsLoaderOnRemoved, true);
            (event.target as HTMLElement).style.display = 'none';
            articleMenuComponent.onScrollListener();
            sectionMenuComponent.onScrollListener();
        }
        event.stopPropagation();
    }
}

export default new CommentsComponent();