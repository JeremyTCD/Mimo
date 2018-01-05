import Component from './component';
import * as Clipboard from 'clipboard';

class ArticleComponent extends Component {
    protected canInitialize(): boolean {
        return true;
    }

    protected setup(): void {
        this.addLinks();
    }

    protected registerListeners(): void {
    }

    private addLinks(): void {
        let article: HTMLElement = document.getElementById('_content');
        let headers: NodeList = article.querySelectorAll('h2, h3, h4');
        let linkMaster: HTMLAnchorElement = document.createElement('a');

        linkMaster.classList.add('heading-link');

        for (let i: number = 0; i < headers.length; i++) {
            let headerElement: HTMLElement = headers[i] as HTMLElement;
            let anchorElement: HTMLAnchorElement = linkMaster.cloneNode() as HTMLAnchorElement;
            let href: string = location.protocol + '//' + location.host + location.pathname + '#' + headerElement.id;

            anchorElement.setAttribute('href', href);
            anchorElement.setAttribute('data-clipboard-text', href);
            anchorElement.setAttribute('data-clipboard-action', 'copy');
            anchorElement.setAttribute('data-tooltip', 'Link copied');

            headerElement.appendChild(anchorElement.cloneNode());
        }

        let clipboard = new Clipboard('.heading-link');
    }
}

export default new ArticleComponent();