import { injectable } from 'inversify';
import CollapsibleMenu from './collapsibleMenu';
import StringService from './stringService';
import HeightService from './heightService';

@injectable()
export default class CollapsibleMenuFactory {
    public constructor(
        private _stringService: StringService,
        private _heightService: HeightService) {
    }

    public build(rootElement: HTMLElement): CollapsibleMenu {
        return new CollapsibleMenu(rootElement, this._stringService, this._heightService);
    }
}