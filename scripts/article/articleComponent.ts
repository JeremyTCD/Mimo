import { injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import TooltipService from '../shared/tooltipService';
import * as Clipboard from 'clipboard';

@injectable()
export default class ArticleComponent extends RootComponent {
    private _tooltipService: TooltipService;

    public constructor(tooltipService: TooltipService) {
        super();

        this._tooltipService = tooltipService;
    }

    public enabled(): boolean {
        // Always exists
        return true;
    }

    public setupImmediate(): void {
        // Do nothing
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    public validDomElementExists(): boolean {
        // Article always exists
        return true;
    }

    public setupOnDomContentLoaded(): void {
        this.addLinks();
    }

    public registerListeners(): void {
        // Do nothing
    }

    private addLinks(): void {
        let articleElement: HTMLElement = document.querySelector('.jtcd-article') as HTMLElement;
        let headingElements: NodeList = articleElement.querySelectorAll('.heading-1, .heading-2');

        for (let i: number = 0; i < headingElements.length; i++) {
            let headingElement = headingElements[i] as HTMLElement;
            let buttonElement = headingElement.querySelector('div[role="button"]') as HTMLElement;

            let headingID = headingElement.getAttribute('id');
            let href = `${location.protocol}//${location.host}${location.pathname}${headingID}`;

            // Clipboard for button
            buttonElement.setAttribute('data-clipboard-text', href);
            new Clipboard(buttonElement);

            // 'Popup' for button
            this._tooltipService.setupElement(buttonElement, 'right');
        }
    }
}