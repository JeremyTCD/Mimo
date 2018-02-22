import svgService from './svgService';
import tooltipService from './tooltipService';
import * as Clipboard from 'clipboard';
import * as hljs from 'highlight.js';

class CodeService {
    public setupCodeBlocks() {
        let copyButtonElements = document.querySelectorAll('.code-block div[role="button"]');

        // On click "popups"
        for (let i = 0; i < copyButtonElements.length; i++) {
            tooltipService.setupElement(copyButtonElements[i] as HTMLElement, 'left');
        }

        // Copy to clipboard
        let clipboard = new Clipboard(copyButtonElements);
        clipboard.on('success', (event: Clipboard.Event) => {
            event.clearSelection();
        });

        hljs.initHighlighting();
    }
}

export default new CodeService();