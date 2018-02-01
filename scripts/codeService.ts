import svgService from './svgService';
import * as Clipboard from 'clipboard';
import * as Tippy from 'tippy.js';

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
            buttonElement.setAttribute('title', 'Code copied');
            Tippy(buttonElement, {
                placement: 'left',
                duration: 400,
                hideOnClick: false,
                trigger: 'manual',
                animateFill: false
            });
            let tooltip = (buttonElement as any)._tippy;
            buttonElement.addEventListener('click', (event: Event) => {
                if (!tooltip.state.visible) {
                    tooltip.show();
                }
            });
            buttonElement.addEventListener('mouseleave', (event: Event) => {
                if (tooltip.state.visible) {
                    tooltip.hide();
                }
            });

            buttonElement.setAttribute('title', 'Copy code');
        }

        let clipboard = new Clipboard(document.querySelectorAll('pre > button'));
        clipboard.on('success', (event: Clipboard.Event) => {
            event.clearSelection();
        });
    }
}

export default new CodeService();