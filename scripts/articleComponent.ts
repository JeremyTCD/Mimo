import Component from './component';
import svgService from './svgService';
import * as Clipboard from 'clipboard';

class ArticleComponent extends Component {
    protected validDomElementExists(): boolean {
        // Article always exists
        return true;
    }

    protected setup(): void {
        this.addLinks();
    }

    protected registerListeners(): void {
    }

    private addLinks(): void {
        let articleElement: HTMLElement = document.querySelector('.jtcd-article') as HTMLElement;
        let headersToLink: NodeList = articleElement.querySelectorAll('h2, h3');
        let anchorMaster: HTMLAnchorElement = document.createElement('a');
        let svgElement: SVGElement = svgService.createSvgExternalSpriteElement('material-design-link');

        anchorMaster.classList.add('heading-link');
        anchorMaster.appendChild(svgElement);

        // Clipboard shared attributes
        anchorMaster.setAttribute('data-clipboard-action', 'copy');

        for (let i: number = 0; i < headersToLink.length; i++) {
            let headerElement: HTMLElement = headersToLink[i] as HTMLElement;
            let anchorElement: HTMLAnchorElement = anchorMaster.cloneNode(true) as HTMLAnchorElement;
            let spanElement: HTMLElement = document.createElement('span');
            let href: string = `${location.protocol}//${location.host}${location.pathname}#${headerElement.id}`;

            spanElement.innerHTML = headerElement.innerHTML;
            headerElement.innerHTML = '';
            headerElement.appendChild(spanElement);

            anchorElement.setAttribute('href', href);
            anchorElement.setAttribute('data-clipboard-text', href);

            spanElement.appendChild(anchorElement);
        }

        let clipboard = new Clipboard('.heading-link');
    }
}

export default new ArticleComponent();