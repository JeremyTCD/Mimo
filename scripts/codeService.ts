import svgService from './svgService';
import tooltipService from './tooltipService';
import * as Clipboard from 'clipboard';

class CodeService {
    public setupCodeBlocks() {
        let codeBlocks = document.querySelectorAll('pre > code');
        let copySvg = svgService.createSvgExternalSpriteElement('material-design-copy');
        // Firefox does not support hover events for svgs within button elements, so use a div and assign 'button' to its role attribute
        let buttonMaster = document.createElement('div');

        buttonMaster.setAttribute('role', 'button');
        buttonMaster.appendChild(copySvg);

        for (let i = 0; i < codeBlocks.length; i++) {
            let codeBlock = codeBlocks[i];
            let buttonElement = buttonMaster.cloneNode(true) as HTMLElement;
            let codeBlockID = codeBlock.getAttribute('name');

            codeBlock.setAttribute('id', codeBlockID);
            buttonElement.setAttribute('data-clipboard-target', `#${codeBlockID}`);

            codeBlock.parentElement.appendChild(buttonElement);

            // Tooltip for copy button
            tooltipService.setupElement(buttonElement, 'Code copied', 'left');

            // Tooltip service uses the title element to generate the code copied tooltip, add a proper title for accessibility reasons
            buttonElement.setAttribute('title', 'Copy code');
        }

        let clipboard = new Clipboard(document.querySelectorAll('pre > button'));
        clipboard.on('success', (event: Clipboard.Event) => {
            event.clearSelection();
        });
    }
}

export default new CodeService();