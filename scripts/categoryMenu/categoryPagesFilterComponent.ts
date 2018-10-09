import { injectable } from 'inversify';
import Component from '../shared/component';
import TextInputFactory from '../shared/textInputFactory';
import CategoryPagesComponent from './categoryPagesComponent';

@injectable()
export default class CategoryPagesFilterComponent implements Component {
    private _textInputFactory: TextInputFactory;

    private _categoryPagesComponent: CategoryPagesComponent;

    private _categoryPagesElement: HTMLElement;
    private _filterElement: HTMLElement;
    private _inputElement: HTMLInputElement;
    private _clearElement: HTMLElement;

    public constructor(categoryPagesComponent: CategoryPagesComponent,
        textInputFactory: TextInputFactory) {
        this._categoryPagesComponent = categoryPagesComponent;
        this._textInputFactory = textInputFactory;
    }

    public setupOnDomContentLoaded(): void {
        this._categoryPagesElement = document.getElementById('category-pages');
        this._filterElement = document.getElementById('category-pages-filter');
        this._inputElement = this._filterElement.querySelector('input');
        this._clearElement = this._filterElement.querySelector('svg:last-child') as HTMLElement;

        this.
            _textInputFactory.
            build(this._filterElement,
            this._inputElement,
            this._clearElement,
            () => {
                if (this._categoryPagesComponent.collapsibleMenu) {
                    this._categoryPagesComponent.collapsibleMenu.restorePreFilterState();
                }
            });
    }

    public setupOnLoad(): void {
        this.
            _inputElement.
            addEventListener('input', this.onInputListener);
    }

    public setupImmediate(): void {
        // Do nothing
    }

    private onInputListener = (): void => {
        // Category pages' collapsible menu is only built after an ajax request returns the elements it contains.
        if (this._categoryPagesComponent.collapsibleMenu) {
            let filterValue: string = this._inputElement.value;
            if (filterValue === '') {
                this._categoryPagesComponent.collapsibleMenu.restorePreFilterState();
                return;
            }

            if (!this._categoryPagesElement.classList.contains('filtered')) {
                this._categoryPagesComponent.collapsibleMenu.savePreFilterState();
                this._categoryPagesElement.classList.add('filtered');
            }

            this._categoryPagesComponent.collapsibleMenu.filter(filterValue);
        }
    }
}
