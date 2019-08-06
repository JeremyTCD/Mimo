import { injectable } from 'inversify';
import RootComponent from '../shared/rootComponent';
import ScrollableIndicatorsFactory from '../shared/scrollableIndicatorsFactory';
import { ScrollableIndicatorsAxis } from '../shared/scrollableIndicatorsAxis';

@injectable()
export default class BreadcrumbsComponent extends RootComponent {

    private _breadcrumbsElement: HTMLElement;

    public constructor(private _scrollableIndicatorsFactory: ScrollableIndicatorsFactory) {
        super();
    }

    public enabled(): boolean {
        if (this._breadcrumbsElement === undefined) {
            this._breadcrumbsElement = document.querySelector('.breadcrumbs');
        }

        return this._breadcrumbsElement ? true : false;
    }

    public setupOnDomInteractive(): void {
        // Do nothing
    }

    public setupOnLoad(): void {
        // Scrollable indicators
        let barSeparatedList = this._breadcrumbsElement.querySelector('.scrollable-indicators') as HTMLElement;
        this._scrollableIndicatorsFactory.tryBuild(barSeparatedList, ScrollableIndicatorsAxis.horizontal);
    }
}
