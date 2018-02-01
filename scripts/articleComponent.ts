import Component from './component';
import svgService from './svgService';
import tooltipService from './tooltipService';
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
        let buttonMaster: HTMLElement = document.createElement('button');
        let svgElement: SVGElement = svgService.createSvgExternalSpriteElement('material-design-link');

        buttonMaster.appendChild(svgElement);

        // Clipboard shared attributes
        buttonMaster.setAttribute('data-clipboard-action', 'copy');

        for (let i: number = 0; i < headersToLink.length; i++) {
            let headerElement: HTMLElement = headersToLink[i] as HTMLElement;
            let buttonElement: HTMLElement = buttonMaster.cloneNode(true) as HTMLElement;
            let spanElement: HTMLElement = document.createElement('span');
            let href: string = `${location.protocol}//${location.host}${location.pathname}#${headerElement.id}`;

            // This is just to facilitate styling
            spanElement.innerHTML = headerElement.innerHTML;
            headerElement.innerHTML = '';
            headerElement.appendChild(spanElement);

            buttonElement.setAttribute('data-clipboard-text', href);

            spanElement.appendChild(buttonElement);

            // Tooltip for button
            tooltipService.setupElement(buttonElement, 'Link copied', 'right');

            buttonElement.setAttribute('title', 'Copy link');
        }

        let clipboard = new Clipboard('.heading-link');
    }
}

export default new ArticleComponent();