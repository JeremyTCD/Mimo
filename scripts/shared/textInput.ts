export default class TextInput {
    constructor(private _wrapperElement: HTMLElement,
        private _inputElement: HTMLInputElement,
        private _clearElement: HTMLElement,
        private _onReset: () => void) {

        _inputElement.addEventListener('focus', this.inputFocusEventListener);
        _inputElement.addEventListener('focusout', this.inputFocusOutEventListener);
        _inputElement.addEventListener('keyup', this.inputKeyUpEventListener);
        _clearElement.addEventListener('click', this.clearClickEventListener);
    }

    public reset() {
        this._inputElement.value = '';
        this.deactivateWrapper();
        this.hideClearElement();

        if (this._onReset) {
            this._onReset();
        }
    }

    private inputKeyUpEventListener = (event: KeyboardEvent) => {
        // Edge returns Esc
        if (event.key === 'Escape' || event.key === 'Esc') {
            this.reset();
            return;
        }

        this._clearElement.removeEventListener('transitionend', this.clearElementTransitionEndListener);
        if (this._inputElement.value.length > 0) {
            this.showClearElement();
        } else {
            this.hideClearElement();
        }
    }

    private clearClickEventListener = () => {
        this.reset();

        // Keep focus on search input so further searches can be made (no point placing focus on clear button)
        this._inputElement.focus();
    }

    private inputFocusOutEventListener = () => {
        // If there is still text, search input is still "active"
        if (this._inputElement.value.length === 0) {
            this.deactivateWrapper();
        }
    }

    private inputFocusEventListener = () => {
        this.activateWrapper();
    }

    private activateWrapper = () => {
        this._wrapperElement.classList.add('active');
    }

    private deactivateWrapper = () => {
        this._wrapperElement.classList.remove('active');
    }

    private showClearElement() {
        this._clearElement.style.display = 'flex';
        this._clearElement.classList.add('active');
    }

    private hideClearElement() {
        this._clearElement.classList.remove('active');
        this._clearElement.addEventListener('transitionend', this.clearElementTransitionEndListener);
    }

    private clearElementTransitionEndListener = () => {
        this._clearElement.style.display = 'none';
    }
}