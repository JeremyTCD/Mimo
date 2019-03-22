import { named, injectable, inject } from 'inversify';
import RootComponent from '../shared/rootComponent';
import MediaGlobalService from '../shared/mediaGlobalService';
import { MediaWidth } from '../shared/mediaWidth';
import DropdownFactory from '../shared/dropdownFactory';
import Dropdown from '../shared/dropdown';
import SearchComponent from './searchComponent';

@injectable()
export default class PageHeaderComponent extends RootComponent {
    private _dropdown: Dropdown;

    public constructor(
        @inject('GlobalService') @named('MediaGlobalService') private _mediaGlobalService: MediaGlobalService,
        private _dropdownFactory: DropdownFactory,
        private _searchComponent: SearchComponent) {
        super();
        this.addChildComponents(_searchComponent);
    }

    public enabled(): boolean {
        // Header always exists
        return true;
    }

    public setupImmediate(): void {
        // Do nothing
    }

    public setupOnDomContentLoaded(): void {
        // Dropdown
        this._dropdown = this._dropdownFactory.build(document.querySelector('.page-header'),
            null, null,
            () => {
                if (this._dropdown.isExpanded) {
                    this._searchComponent.collapseResults();
                }
            },
            false, true, false, false);
    }

    public setupOnLoad(): void {
        this._mediaGlobalService.addChangedFromListener(this.onChangedToBarListener, MediaWidth.narrow);
        this._mediaGlobalService.addChangedToListener(this.onChangedToDropdownListener, MediaWidth.narrow);
    }

    private onChangedToDropdownListener = () => {
        if (this._searchComponent.isExpanded()) {
            this._dropdown.expand(false, false, false, false);
        }
    }

    private onChangedToBarListener = () => {
        if (!this._dropdown.isCollapsed()) {
            // If dropdown isn't collapsed but search is collapsed, reset overlay
            // If dropdown and search results are expanded, deactivate overlay (still visible because of activation by search service)
            this._dropdown.reset(this._searchComponent.isCollapsed(),
                this._searchComponent.isExpanded());
        }
        else {
            this._dropdown.reset();
        }
    }
} 