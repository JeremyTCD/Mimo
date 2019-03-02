import { named, injectable, inject } from 'inversify';
import Outline from './outline';
import ArticleGlobalService from '../shared/articleGlobalService';


@injectable()
export default class OutlineFactory {
    public constructor(@inject('GlobalService') @named('ArticleGlobalService') private _articleGlobalService: ArticleGlobalService) {}

    public build(rootElement: HTMLUListElement, anchorOnClick: { (): void }): Outline {
        return new Outline(this._articleGlobalService, anchorOnClick, rootElement);
    }
}