import { injectable, inject, named } from 'inversify';
import Component from '../shared/component';
import ArticleGlobalService from '../shared/articleGlobalService';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';
import ArticleMenuHeaderTextData from './articleMenuHeaderTextData';

@injectable()
export default class ArticleMenuHeaderComponent implements Component {
    private _articleGlobalService: ArticleGlobalService;
    private _mediaGlobalService: MediaGlobalService;

    private _text1Element: HTMLElement;
    private _text2Element: HTMLElement;
    private _textData: ArticleMenuHeaderTextData[];

    public constructor( @inject('GlobalService') @named('ArticleGlobalService') articleGlobalService: ArticleGlobalService,
        @inject('GlobalService') @named('MediaGlobalService') mediaGlobalService: MediaGlobalService) {

        this._mediaGlobalService = mediaGlobalService;
        this._articleGlobalService = articleGlobalService;
    }

    public setupImmediate(): void {
        this._text1Element = document.getElementById('article-menu-header-text-1');
        this._text2Element = document.getElementById('article-menu-header-text-2');
        this._textData = [];
        this.setupText();
    }

    public setupOnDomContentLoaded(): void {
    }

    public setupOnLoad(): void {
        this._mediaGlobalService.addChangedToListener(this.onChangedToNarrowListener, MediaWidth.narrow)
        this._mediaGlobalService.addChangedFromListener(this.onChangedFromNarrowListener, MediaWidth.narrow);
    }

    private onChangedToNarrowListener = (): void => {
        // While article menu is a side menu, text isn't updated. When article menu becomes a dropdown, it must be updated manually
        this._articleGlobalService.addIndexChangedListener(this.updateText, true);
    }

    private onChangedFromNarrowListener = (init: boolean): void => {
        if (!init) {
            this._articleGlobalService.removeIndexChangedListener(this.updateText);
        }
    }

    private updateText = (activeHeaderIndex: number): void => {
        if (activeHeaderIndex === -1) {
            this._text1Element.innerText = 'Table of Contents';
            this._text2Element.parentElement.style.display = 'none';
            return;
        }

        let headerData: ArticleMenuHeaderTextData = this._textData[activeHeaderIndex];

        this._text1Element.innerText = headerData.text1;

        if (headerData.text2) {
            this._text2Element.innerText = headerData.text2;
            this._text2Element.parentElement.style.display = 'flex';
        } else {
            this._text2Element.parentElement.style.display = 'none';
        }
    }

    private setupText(): void {
        let currentH1Text: string;
        let headerElements: NodeList = this._articleGlobalService.getHeaderElements();

        for (let i = 0; i < headerElements.length; i++) {
            let headerElement = headerElements[i] as HTMLElement;

            if (headerElement.classList.contains('header-1')) {
                currentH1Text = headerElement.innerText;
                this._textData.push({ text1: currentH1Text, text2: null });
            } else {
                // h2
                this._textData.push({ text1: currentH1Text, text2: headerElement.innerText });
            }
        }
    }
}
