﻿import { injectable } from 'inversify';
import RootComponent from '../shared/rootComponent';
import TooltipService from '../shared/tooltipService';
import * as Clipboard from 'clipboard';
import CodeService from '../shared/codeService';

@injectable()
export default class ArticleComponent extends RootComponent {
    private _tooltipService: TooltipService;
    private _codeService: CodeService;

    public constructor(tooltipService: TooltipService,
        codeService: CodeService) {
        super();

        this._tooltipService = tooltipService;
        this._codeService = codeService;
    }

    public enabled(): boolean {
        // Always exists
        return true;
    }

    public setupImmediate(): void {
        this._codeService.setupCodeBlocks();
    }

    public setupOnLoad(): void {
    }

    public validDomElementExists(): boolean {
        // Article always exists
        return true;
    }

    public setupOnDomContentLoaded(): void {
        this.setupSectionHeaderLinks();
    }

    private setupSectionHeaderLinks(): void {
        let articleElement: HTMLElement = document.querySelector('.main-article') as HTMLElement;
        let sectionElements: NodeList = articleElement.querySelectorAll('section[class*="flexi-section-block-"]');

        for (let i: number = 0; i < sectionElements.length; i++) {
            let sectionElement = sectionElements[i] as HTMLElement;
            let buttonElement = sectionElement.querySelector('button');
            let id = sectionElement.getAttribute('id');
            let href = `${location.protocol}//${location.host}${location.pathname}#${id}`;

            // Clipboard for button
            buttonElement.setAttribute('data-clipboard-text', href);
            new Clipboard(buttonElement);

            // 'Popup' for button
            buttonElement.setAttribute('title', 'Link copied');
            this._tooltipService.setupElement(buttonElement, 'right');
        }
    }
}