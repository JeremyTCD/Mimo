import { injectable } from 'inversify';

@injectable()
export default class Pagination {
    private static readonly BUTTON_HIDDEN_CLASS: string = 'pagination__button--hidden';
    private static readonly BUTTON_DISABLED_CLASS: string = 'pagination__button--disabled';
    private static readonly BUTTON_ACTIVE_CLASS: string = 'pagination__button--active';

    private _buttonsElement: HTMLUListElement;
    private _previousButtonElement: HTMLButtonElement;
    private _nextButtonElement: HTMLButtonElement;
    private _itemsElement: HTMLElement;
    private _items: HTMLElement[];
    private _pageButtonElements: HTMLElement[];

    private _currentPageNum: number;
    private _currentNumPages: number;
    private _currentNumPageButtons: number;
    private _currentFirstPageButtonNum: number;

    public constructor(private _rootElement: HTMLElement,
        private _maxNumItemsPerPage: number = 5,
        private _maxNumPageButtons: number = 5,
        private _onRenderPage?: (rootElement: HTMLElement) => void) {
        this._buttonsElement = this._rootElement.querySelector('.pagination__buttons');
        this._previousButtonElement = this._buttonsElement.querySelector('.pagination__previous-button');
        this._nextButtonElement = this._buttonsElement.querySelector('.pagination__next-button');
        this._itemsElement = this._rootElement.querySelector('.pagination__items');

        this._previousButtonElement.addEventListener('click', this.previousButtonOnClickListener);
        this._nextButtonElement.addEventListener('click', this.nextButtonOnClickListener);

        let initialItems = this._rootElement.querySelectorAll('.pagination__items > *');
        if (initialItems.length > 0) {
            this.setItems(Array.from(initialItems) as HTMLElement[]);
        }
    }

    public setItems(items: HTMLElement[]) {
        this._items = items;
        this._currentNumPages = Math.ceil(items.length / this._maxNumItemsPerPage);
        this._currentPageNum = 1;

        // Page buttons
        this._currentNumPageButtons = Math.min(this._currentNumPages, this._maxNumPageButtons);

        if (!this._pageButtonElements) {
            let masterPageButtonElement = document.createElement('button');
            masterPageButtonElement.classList.add('.pagination__page-button');
            this._pageButtonElements = [];
            for (let i = 0; i < this._maxNumPageButtons; i++) {
                let pageButtonElement = masterPageButtonElement.cloneNode() as HTMLElement;
                this._pageButtonElements.push(pageButtonElement);
                this._buttonsElement.insertBefore(pageButtonElement, this._nextButtonElement);
                pageButtonElement.addEventListener('click', this.pageButtonOnClickListener);
            }
        }

        for (let i = 0; i < this._pageButtonElements.length; i++) {
            let pageButtonElement = this._pageButtonElements[i]

            if (i < this._currentNumPageButtons) {
                pageButtonElement.classList.remove(Pagination.BUTTON_HIDDEN_CLASS);
            }
            else {
                pageButtonElement.classList.add(Pagination.BUTTON_HIDDEN_CLASS);
                pageButtonElement.setAttribute('aria-label', 'disabled');
                pageButtonElement.setAttribute('title', 'disabled');
                pageButtonElement.setAttribute('disabled', '');
            }
        }

        this.renderCurrentPage();
    }

    private previousButtonOnClickListener = () => {
        if (this._currentPageNum === 1) {
            return;
        }

        this._currentPageNum--;
        this.renderCurrentPage();
    }

    private nextButtonOnClickListener = () => {
        if (this._currentPageNum === this._currentNumPages) {
            return;
        }

        this._currentPageNum++;
        this.renderCurrentPage();
    }

    private pageButtonOnClickListener = () => {
        let newPageNumber = this._currentFirstPageButtonNum + this._pageButtonElements.indexOf(event.currentTarget as HTMLElement);

        if (this._currentPageNum === newPageNumber) {
            return;
        }

        this._currentPageNum = newPageNumber;
        this.renderCurrentPage();
    }

    private renderCurrentPage() {
        // Get items
        let currentItemsStartIndex = (this._currentPageNum - 1) * this._maxNumItemsPerPage;

        // Remove old items, add new items
        this._itemsElement.innerHTML = '';
        let end = Math.min(currentItemsStartIndex + this._maxNumItemsPerPage, this._items.length);
        for (let i = currentItemsStartIndex; i < end; i++) {
            this._itemsElement.appendChild(this._items[i]);
        }

        // Buttons
        let middleButtonPosition = Math.round(this._currentNumPageButtons / 2);

        if (this._currentPageNum < middleButtonPosition) {
            this._currentFirstPageButtonNum = 1;
        } else if (this._currentNumPages - this._currentPageNum < middleButtonPosition) {
            this._currentFirstPageButtonNum = this._currentNumPages - this._currentNumPageButtons + 1;
        } else {
            this._currentFirstPageButtonNum = this._currentPageNum - middleButtonPosition + 1;
        }

        if (this._currentPageNum == 1) {
            this._previousButtonElement.classList.add(Pagination.BUTTON_DISABLED_CLASS);
            this._previousButtonElement.setAttribute('disabled', '');
        }
        else {
            this._previousButtonElement.classList.remove(Pagination.BUTTON_DISABLED_CLASS);
        }
        if (this._currentPageNum == this._currentNumPages) {
            this._nextButtonElement.classList.add(Pagination.BUTTON_DISABLED_CLASS);
            this._nextButtonElement.setAttribute('disabled', '');
        }
        else {
            this._nextButtonElement.classList.remove(Pagination.BUTTON_DISABLED_CLASS);
        }

        for (let i = 0; i < this._currentNumPageButtons; i++) {
            let buttonNum = this._currentFirstPageButtonNum + i;
            let pageButtonElement = this._pageButtonElements[i];

            if (buttonNum == this._currentPageNum) {
                pageButtonElement.classList.add(Pagination.BUTTON_ACTIVE_CLASS);
            } else {
                pageButtonElement.classList.remove(Pagination.BUTTON_ACTIVE_CLASS);
            }

            let buttonNumAsString = buttonNum.toString();
            pageButtonElement.textContent = buttonNum.toString();
            pageButtonElement.setAttribute('aria-label', `Page ${buttonNumAsString}`);
            pageButtonElement.setAttribute('title', `Page ${buttonNumAsString}`);
        }

        if (this._onRenderPage) {
            this._onRenderPage(this._rootElement);
        }
    }
}