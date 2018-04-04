import { injectable } from 'inversify';
import Component from '../shared/component';

@injectable()
export default class ArticleLinksComponent implements Component {
    private _shareArticleElement: HTMLElement;
    private _shareArticleSpanElement: HTMLElement;
    private _shareArticleLinksWrapperElement: HTMLElement;

    public static readonly TOP_NEGATIVE_MARGIN: number = -3;

    public setupImmediate(): void {
    }

    public setupOnDomContentLoaded(): void {

        this._shareArticleElement = document.getElementById('share-article');
        if (this._shareArticleElement) {
            this._shareArticleSpanElement = document.querySelector('#share-article > span');
            this._shareArticleLinksWrapperElement = document.getElementById('share-article-links-wrapper');
            this._shareArticleSpanElement.addEventListener('mouseenter', this.shareArticleSpanOnEnter);
            this._shareArticleElement.addEventListener('mouseleave', this.shareArticleOnLeave);
        }
    }

    public setupOnLoad(): void {
    }

    public shareArticleSpanOnEnter = (): void => {
        this._shareArticleLinksWrapperElement.classList.add('active');
    }

    public shareArticleOnLeave = (): void => {
        this._shareArticleLinksWrapperElement.classList.remove('active');
    }
}
