import Component from './component';

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
        let headers: NodeList = article.querySelectorAll('h2, h3');
        let linkMaster: HTMLAnchorElement = document.createElement('a');

        linkMaster.classList.add('header-link');

        for (let i: number = 0; i < headers.length; i++) {
            let header: HTMLElement = headers[i] as HTMLElement;
            let link: HTMLAnchorElement = linkMaster.cloneNode() as HTMLAnchorElement;

            link.setAttribute('href', location.protocol + '//' + location.host + location.pathname + '#' + header.id);

            header.appendChild(link.cloneNode());
        }
    }
}

export default new ArticleComponent();