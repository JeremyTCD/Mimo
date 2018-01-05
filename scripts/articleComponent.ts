import Component from './component';
import SvgService from './svgService';
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
        let anchorMaster: HTMLAnchorElement = document.createElement('a');
        let svgElement: SVGElement = SvgService.createSvgExternalSpriteElement('material-design-link');

        anchorMaster.classList.add('heading-link');
        anchorMaster.appendChild(svgElement);

        // Clipboard shared attributes
        anchorMaster.setAttribute('data-clipboard-action', 'copy');

        for (let i: number = 0; i < headers.length; i++) {
            let headerElement: HTMLElement = headers[i] as HTMLElement;
            let anchorElement: HTMLAnchorElement = anchorMaster.cloneNode(true) as HTMLAnchorElement;
            let href: string = `${location.protocol}//${location.host}${location.pathname}#${headerElement.id}`;

            anchorElement.setAttribute('href', href);
            anchorElement.setAttribute('data-clipboard-text', href);

            headerElement.appendChild(anchorElement);
        }

        let clipboard = new Clipboard('.heading-link');
    }
}

export default new ArticleComponent();