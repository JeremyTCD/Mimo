import { injectable } from 'inversify';

import TooltipService from './tooltipService';

import * as Clipboard from 'clipboard';

@injectable()
export default class CodeService {
    private _tooltipService: TooltipService;

    public constructor(tooltipService: TooltipService) {
        this._tooltipService = tooltipService;
    }

    public setupCodeBlocks() {
        let codeBlockElements = document.querySelectorAll(".flexi-code-block");

        // On click "popups"
        for (let i = 0; i < codeBlockElements.length; i++) {
            let codeBlockElement = codeBlockElements[i];

            // Add id to code element so we can copy its contents using clipboard
            let codeElementID = `code-${i}`;
            let codeElement = codeBlockElement.querySelector("code") as HTMLElement;
            codeElement.setAttribute("id", codeElementID);

            // Setup tippy for copy button
            let copyButtonElement = codeBlockElement.querySelector("button") as HTMLElement;
            copyButtonElement.setAttribute('title', 'Code copied');
            copyButtonElement.setAttribute('data-clipboard-target', `#${codeElementID}`);
            this._tooltipService.setupElement(copyButtonElement, 'left');
        }

        // Copy to clipboard
        let clipboard = new Clipboard(document.querySelectorAll(".flexi-code-block button")); // re-query for button elements since the constructor expects a NodeList
        clipboard.on('success', (event: Clipboard.Event) => {
            event.clearSelection();
        });
    }
}