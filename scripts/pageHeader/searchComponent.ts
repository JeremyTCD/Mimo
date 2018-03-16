import { injectable, inject } from 'inversify';
import Component from '../shared/component';
import TextInputFactory from '../shared/textInputFactory';
import TextInput from '../shared/textInput';
import SearchResultsComponent from './searchResultsComponent';
import SearchService from '../shared/searchService';

@injectable()
export default class SearchComponent implements Component {
    private _textInputFactory: TextInputFactory;
    private _textInput: TextInput;
    private _searchElement: HTMLElement;
    private _inputElement: HTMLInputElement;
    private _clearElement: HTMLElement;
    private _searchResultsComponent: SearchResultsComponent;
    private _searchService: SearchService;

    public constructor(textInputFactory: TextInputFactory,
        searchResultsComponent: SearchResultsComponent,
        searchService: SearchService) {
        this._textInputFactory = textInputFactory;
        this._searchResultsComponent = searchResultsComponent;
        this._searchService = searchService;
    }

    public setupImmediate(): void {
        this._searchService.setupSearch();
    }

    public setupOnDomContentLoaded(): void {
        this._searchElement = document.getElementById('page-header-search') as HTMLElement;
        this._inputElement = this._searchElement.querySelector('input') as HTMLInputElement;
        this._clearElement = this._searchElement.querySelector('svg:last-child') as HTMLElement;

        this._textInput = this.
            _textInputFactory.
            build(this._searchElement,
                this._inputElement,
                this._clearElement,
                () => {
                    // This is what search service calls when value is an empty string
                    this._searchResultsComponent.setShown(false);
                });
    }

    public setupOnLoad(): void {
        // Do nothing
    }

    public registerListeners(): void {
    }

    public hasQuery(): boolean {
        return this._inputElement.value.length > 0;
    }

    public reset(): void {
        this._textInput.reset();
    }
}
