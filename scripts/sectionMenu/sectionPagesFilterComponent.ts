import { injectable } from 'inversify';
import Component from '../shared/component';
import TextInputFactory from '../shared/textInputFactory';
import SectionPagesComponent from './sectionPagesComponent';

@injectable()
export default class SectionPagesFilterComponent implements Component {
    private _textInputFactory: TextInputFactory;

    private _sectionPagesComponent: SectionPagesComponent;

    private _sectionPagesElement: HTMLElement;
    private _filterElement: HTMLElement;
    private _inputElement: HTMLInputElement;
    private _clearElement: HTMLElement;

    public constructor(sectionPagesComponent: SectionPagesComponent,
        textInputFactory: TextInputFactory) {
        this._sectionPagesComponent = sectionPagesComponent;
        this._textInputFactory = textInputFactory;
    }

    public setupOnDomContentLoaded(): void {
        this._sectionPagesElement = document.getElementById('section-pages');
        this._filterElement = document.getElementById('section-pages-filter');
        this._inputElement = this._filterElement.querySelector('input');
        this._clearElement = this._filterElement.querySelector('svg:last-child') as HTMLElement;

        this.
            _textInputFactory.
            build(this._filterElement,
            this._inputElement,
            this._clearElement,
            () => {
                if (this._sectionPagesComponent.collapsibleMenu) {
                    this._sectionPagesComponent.collapsibleMenu.restorePreFilterState();
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
        // Section pages' collapsible menu is only built after an ajax request returns the elements it contains.
        if (this._sectionPagesComponent.collapsibleMenu) {
            let filterValue: string = this._inputElement.value;
            if (filterValue === '') {
                this._sectionPagesComponent.collapsibleMenu.restorePreFilterState();
                return;
            }

            if (!this._sectionPagesElement.classList.contains('filtered')) {
                this._sectionPagesComponent.collapsibleMenu.savePreFilterState();
                this._sectionPagesElement.classList.add('filtered');
            }

            this._sectionPagesComponent.collapsibleMenu.filter(filterValue);
        }
    }
}
