import { injectable } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MainArticleComponent from './mainArticleComponent';
import CommentsComponent from './commentsComponent';
import PaginationFactory from '../shared/paginationFactory';

@injectable()
export default class MainComponent extends RootComponent {
    public constructor(private _paginationFactory: PaginationFactory,
        mainArticleComponent: MainArticleComponent,
        commentsComponent: CommentsComponent) {
        super();
        this.addChildComponents(mainArticleComponent, commentsComponent);
    }

    public enabled(): boolean {
        // Always exists
        return true;
    }

    public setupImmediate(): void {
        // Sorted article list
        let sortedArticleListElement = document.querySelector('.sorted-article-list');
        if (sortedArticleListElement) {
            let paginationElement = sortedArticleListElement.querySelector('.pagination') as HTMLElement;
            this._paginationFactory.build(paginationElement, 5, 5);
        }
    }

    public setupOnDomContentLoaded(): void {
        // Do nothing
    }

    public setupOnLoad(): void {
        // Do nothing
    }
}