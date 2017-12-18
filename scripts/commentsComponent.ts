import Component from './component';

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
            return false;
        }

        this.disqusIdentifier = this.disqusThread.getAttribute('data-disqus-identifier');
        if (!this.disqusIdentifier) {
            console.log('Disqus enabled but identifier not specified.');
            return false;
        }

        return true;
    }

    protected setup(): void {
                
    }

    protected registerListeners(): void {
        window.addEventListener('scroll', this.checkLoadRequired);
    }

    private checkLoadRequired = (): void => {
        // top is relative to the top of the viewport, so as you scroll down, this number decreases
        let disqusTop: number = this.disqusThread.getBoundingClientRect().top;

        if (disqusTop < (window.innerHeight || document.documentElement.clientHeight)) {
            window.removeEventListener('scroll', this.checkLoadRequired);

            let component = this;

            window['disqus_config'] = function() {
                this.page.url = location.host + location.pathname;
                this.page.identifier = component.disqusIdentifier;
            };

            let disqusScript: HTMLScriptElement = document.createElement('script');
            disqusScript.src = `https://${this.disqusShortname}.disqus.com/embed.js`;
            disqusScript.setAttribute('data-timestamp', Date());

            (document.head || document.body).appendChild(disqusScript);

            console.log('Disqus embed script inserted.');
        }
    }
}

export default new CommentsComponent();