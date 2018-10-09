import { injectable, inject, named } from 'inversify';
import Component from '../shared/component';
import ArticleGlobalService from '../shared/articleGlobalService';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';

interface TextData {
    part1: string;
    part2: string;
}

@injectable()
export default class ArticleMenuHeaderComponent implements Component {
    private _articleGlobalService: ArticleGlobalService;
    private _mediaGlobalService: MediaGlobalService;

    private _text1Element: HTMLElement;
    private _text2Element: HTMLElement;
    private _textData: TextData[];

    public constructor(@inject('GlobalService') @named('ArticleGlobalService') articleGlobalService: ArticleGlobalService,
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

    private updateText = (activeSectionIndex: number): void => {
        let textData: TextData = this._textData[activeSectionIndex];

        this._text1Element.innerText = textData.part1;

        if (textData.part2) {
            this._text2Element.innerText = textData.part2;
            this._text2Element.parentElement.style.display = 'flex';
        } else {
            this._text2Element.parentElement.style.display = 'none';
        }
    }

    private setupText(): void {
        let currentPart1: string;
        let sectionElements: NodeList = this._articleGlobalService.getSectionElements();

        for (let i = 0; i < sectionElements.length; i++) {
            let sectionElement = sectionElements[i] as HTMLElement;

            if (sectionElement.classList.contains('main-article')) {
                this._textData.push({ part1: 'Outline', part2: null });
            }
            else if (sectionElement.classList.contains('section-level-2')) {
                currentPart1 = sectionElement.firstElementChild.firstElementChild.innerHTML;
                this._textData.push({ part1: currentPart1, part2: null });
            } else {
                // level 3
                this._textData.push({ part1: currentPart1, part2: sectionElement.firstElementChild.firstElementChild.innerHTML });
            }
        }
    }
}
