import { injectable } from 'inversify';

import TooltipService from './tooltipService';

import * as Clipboard from 'clipboard';
import * as hljs from 'highlight.js';

@injectable()
export default class CodeService {
    private _tooltipService: TooltipService;

    public constructor(tooltipService: TooltipService) {
        this._tooltipService = tooltipService;
    }

    public setupCodeBlocks() {
        let copyButtonElements = document.querySelectorAll('.code-block div[role="button"]');

        // On click "popups"
        for (let i = 0; i < copyButtonElements.length; i++) {
            this._tooltipService.setupElement(copyButtonElements[i] as HTMLElement, 'left');
        }

        // Copy to clipboard
        let clipboard = new Clipboard(copyButtonElements);
        clipboard.on('success', (event: Clipboard.Event) => {
            event.clearSelection();
        });

        hljs.initHighlighting();
    }
}