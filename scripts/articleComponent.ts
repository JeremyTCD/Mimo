import Component from './component';
import svgService from './svgService';
import tooltipService from './tooltipService';
import * as Clipboard from 'clipboard';

class ArticleComponent extends Component {
    protected setupOnLoad(): void {
        // Do nothing
    }

    protected validDomElementExists(): boolean {
        // Article always exists
        return true;
    }

    protected setupOnDomContentLoaded(): void {
        this.addLinks();
    }

    protected registerListeners(): void {
        // Do nothing
    }

    private addLinks(): void {
        let articleElement: HTMLElement = document.querySelector('.jtcd-article') as HTMLElement;
        let headingElements: NodeList = articleElement.querySelectorAll('.heading-1, .heading-2');

        for (let i: number = 0; i < headingElements.length; i++) {
            let headingElement = headingElements[i] as HTMLElement;
            let buttonElement = headingElement.querySelector('div[role="button"]') as HTMLElement;

            let headingID = buttonElement.getAttribute('data-clipboard-text');
            let href = `${location.protocol}//${location.host}${location.pathname}${headingID}`;

            // Clipboard for button
            buttonElement.setAttribute('data-clipboard-text', href);
            new Clipboard(buttonElement);

            // "Popup" for button
            tooltipService.setupElement(buttonElement, 'right');
        }
    }
}

export default new ArticleComponent();