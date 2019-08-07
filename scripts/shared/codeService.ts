import { injectable } from 'inversify';

import TooltipService from './tooltipService';

import * as Clipboard from 'clipboard';

@injectable()
export default class CodeService {

    public constructor(private _tooltipService: TooltipService) {
    }

    public setupCodeBlocks() {
        let codeBlockElements = document.querySelectorAll(".flexi-code");

        // On click "popups"
        for (let i = 0; i < codeBlockElements.length; i++) {
            let codeBlockElement = codeBlockElements[i];

            // Add id to code element so we can copy its contents using clipboard
            let codeElementID = `code-${i}`;
            let codeElement = codeBlockElement.querySelector("code") as HTMLElement;
            codeElement.setAttribute("id", codeElementID);

            // Setup tippy for copy button
            let copyButtonElement = codeBlockElement.querySelector("button") as HTMLElement;
            this._tooltipService.setupElement(copyButtonElement, 'left', 'Code copied');

            // Setup copying to clipboard
            let textGenerator: () => string;
            let code = null;
            if (codeBlockElement.classList.contains("flexi-code_no-line-numbers")) {
                textGenerator = function () {
                    // Do this lazily - not likely that all code blocks will be copied.
                    if (code === null) {
                        code = codeElement.innerText;
                    }
                    return code;
                };
            } else {
                textGenerator = function () {
                    if (code === null) {
                        code = '';
                        let lineElements = codeElement.querySelectorAll(".flexi-code__line:not(.flexi-code__line_omitted-lines)");
                        let lineElementsLastIndex = lineElements.length - 1;
                        lineElements.forEach((value: Element, index: number) => {
                            code += (value as HTMLSpanElement).innerText + (index == lineElementsLastIndex ? '' : '\n');
                        });
                    }
                    return code;
                }
            }

            new Clipboard(copyButtonElement, {
                text: textGenerator
            });
        }
    }
}

