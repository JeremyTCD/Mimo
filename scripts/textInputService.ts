class TextInputService {
    constructor(private wrapperElement: HTMLElement,
        private inputElement: HTMLInputElement,
        private clearElement: HTMLElement,
        private onResetSearchInput: () => void) {

    }

    // This is real ugly, but it helps avoid replication of text input logic
    public setupEventListeners(): void {
        this.inputElement.addEventListener('focus', this.inputFocusEventListener);
        this.inputElement.addEventListener('focusout', this.inputFocusOutEventListener);
        this.inputElement.addEventListener('keyup', this.inputKeyUpEventListener);
        this.clearElement.addEventListener('click', this.clearClickEventListener);
    }

    private inputKeyUpEventListener = (event: KeyboardEvent) => {
        // Edge returns Esc
        if (event.key === 'Escape' || event.key === 'Esc') {
            this.resetSearchInput();
            return;
        }

        if (this.inputElement.value.length > 0) {
            this.clearElement.classList.add('active');
        } else {
            this.clearElement.classList.remove('active');
        }
    }

    private clearClickEventListener = (event: Event) => {
        this.resetSearchInput();

        // Keep focus on search input so further searches can be made (no point placing focus on clear button)
        this.inputElement.focus();
    }

    private inputFocusOutEventListener = (event: Event) => {
        // If there is still text, search input is still "active"
        if (this.inputElement.value.length === 0) {
            this.wrapperElement.classList.remove('active');
        }
    }

    private inputFocusEventListener = (event: Event) => {
        this.wrapperElement.classList.add('active');
    }

    public resetSearchInput() {
        this.inputElement.value = '';
        this.clearElement.classList.remove('active');

        if (this.onResetSearchInput) {
            this.onResetSearchInput();
        }
    }
}

export default TextInputService;