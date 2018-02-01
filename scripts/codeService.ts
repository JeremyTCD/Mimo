import svgService from './svgService';
import tooltipService from './tooltipService';
import * as Clipboard from 'clipboard';

class CodeService {
    public setupCodeBlocks() {
        let codeBlocks = document.querySelectorAll('pre > code');
        let copySvg = svgService.createSvgExternalSpriteElement('material-design-copy');

        for (let i = 0; i < codeBlocks.length; i++) {
            let codeBlock = codeBlocks[i];
            let buttonElement = document.createElement('button');
            let codeBlockID = codeBlock.getAttribute('name');
            let copySvgClone = copySvg.cloneNode(true) as HTMLElement;

            codeBlock.setAttribute('id', codeBlockID);
            buttonElement.setAttribute('data-clipboard-target', `#${codeBlockID}`);

            buttonElement.appendChild(copySvgClone);
            codeBlock.parentElement.appendChild(buttonElement);

            // Tooltip for copy button
            tooltipService.setupElement(buttonElement, 'Code copied', 'left');

            buttonElement.setAttribute('title', 'Copy code');
        }

        let clipboard = new Clipboard(document.querySelectorAll('pre > button'));
        clipboard.on('success', (event: Clipboard.Event) => {
            event.clearSelection();
        });
    }
}

export default new CodeService();