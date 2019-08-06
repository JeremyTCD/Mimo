import { injectable } from 'inversify';
import CollapsibleMenu from './collapsibleMenu';
import StringService from './stringService';
import HeightService from './heightService';
import ScrollableIndicatorsFactory from './scrollableIndicatorsFactory';
import { ScrollableIndicatorsAxis } from './scrollableIndicatorsAxis';

@injectable()
export default class CollapsibleMenuFactory {
    public constructor(
        private _stringService: StringService,
        private _heightService: HeightService,
        private _scrollableIndicatorsFactory: ScrollableIndicatorsFactory) {
    }

    public build(rootElement: HTMLElement): CollapsibleMenu {
        // Scrollable indicators
        this._scrollableIndicatorsFactory.tryBuild(rootElement.querySelector('.scrollable-indicators'), ScrollableIndicatorsAxis.vertical);

        return new CollapsibleMenu(rootElement, this._stringService, this._heightService);
    }
}