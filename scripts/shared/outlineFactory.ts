import { named, injectable, inject } from 'inversify';
import Outline from './outline';
import ArticleGlobalService from '../shared/articleGlobalService';
import ScrollableIndicatorsFactory from './scrollableIndicatorsFactory';
import { ScrollableIndicatorsAxis } from './scrollableIndicatorsAxis';

@injectable()
export default class OutlineFactory {
    public constructor(@inject('GlobalService') @named('ArticleGlobalService') private _articleGlobalService: ArticleGlobalService,
        private _scrollableIndicatorsFactory: ScrollableIndicatorsFactory) {}

    public build(rootElement: HTMLUListElement, anchorOnClick: { (): void }): Outline {
        // Scrollable indicators
        this._scrollableIndicatorsFactory.tryBuild(rootElement.querySelector('.scrollable-indicators'), ScrollableIndicatorsAxis.vertical);

        return new Outline(this._articleGlobalService, anchorOnClick, rootElement);
    }
}