export default class TextInput {
    private _inputElement: HTMLInputElement;
    private _clearButtonElement: HTMLButtonElement;

    private static readonly ACTIVE_CLASS: string = 'text-input--active';
    private static readonly BUTTON_ACTIVE_CLASS: string = 'text-input__button--active';

    constructor(private _textInputElement: HTMLFormElement,
        private _onInput: (value: string) => void,
        private _onReset?: () => void) {

        this._inputElement = _textInputElement.querySelector('.text-input__input');
        this._clearButtonElement = _textInputElement.querySelector('.text-input__button');

        this._inputElement.addEventListener('focus', this.inputFocusEventListener);
        this._inputElement.addEventListener('focusout', this.inputFocusOutEventListener);
        this._inputElement.addEventListener('keyup', this.inputKeyUpEventListener);
        this._inputElement.addEventListener('keydown', this.inputKeyDownEventListener);
        this._clearButtonElement.addEventListener('click', this.clearButtonClickEventListener);
    }

    public reset() {
        this._inputElement.value = '';
        this._clearButtonElement.classList.remove(TextInput.BUTTON_ACTIVE_CLASS);

        if (this._inputElement !== document.activeElement) {
            this._textInputElement.classList.remove(TextInput.ACTIVE_CLASS);
        }

        if (this._onReset) {
            this._onReset();
        }
    }

    public value(): string {
        return this._inputElement.value;
    }

    private inputKeyDownEventListener = (event: KeyboardEvent) => {
        // Pressing enter while input is focused causes a form submission attempt by default
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private inputKeyUpEventListener = (event: KeyboardEvent) => {
        // Edge returns Esc
        if (event.key === 'Escape' || event.key === 'Esc') {
            this.reset();

            return;
        }

        let value = this._inputElement.value;
        if (value.length > 0) {
            this._clearButtonElement.classList.add(TextInput.BUTTON_ACTIVE_CLASS);

            if (this._onInput) {
                this._onInput(value)
            }
        } else {
            this.reset();
        }
    }

    private clearButtonClickEventListener = () => {
        this.reset();

        // Keep focus on search input so further searches can be made (no point placing focus on clear button)
        this._inputElement.focus();
    }

    private inputFocusOutEventListener = () => {
        // If there is still text, search input is still "active"
        if (this._inputElement.value.length === 0) {
            this._textInputElement.classList.remove(TextInput.ACTIVE_CLASS);
        }
    }

    private inputFocusEventListener = () => {
        this._textInputElement.classList.add(TextInput.ACTIVE_CLASS);
    }
}